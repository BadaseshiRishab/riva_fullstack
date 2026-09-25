const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const connectDB = require('./config/db');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Order = require('./models/Order');
const Product = require('./models/Product');
const jwt = require('jsonwebtoken');
const protect = require('./middleware/authMiddleware');

dotenv.config();

connectDB();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());

const generateToken = (user, role = 'user') =>
  jwt.sign({ id: user._id, role }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '7d',
  });

app.get('/', (req, res) => {
  res.send('API is running');
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const userExists = await User.findOne({
    $or: [{ email: normalizedEmail }, ...(phone ? [{ phone: String(phone).trim() }] : [])],
  });

  if (userExists) {
    const message = userExists.email === normalizedEmail ? 'User already exists' : 'Phone number is already registered';
    return res.status(400).json({ message });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    phone: phone ? String(phone).trim() : undefined,
    address: address ? String(address).trim() : '',
    lastLoginAt: new Date(),
  });

  res.status(201).json({
    token: generateToken(user, 'user'),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: 'user',
      lastLoginAt: user.lastLoginAt,
    },
  });
});

app.post('/api/login', async (req, res) => {
  const emailOrPhone = String(req.body.emailOrPhone || req.body.email || req.body.phone || '').trim();
  const { password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ message: 'Email or phone and password are required' });
  }

  const normalizedValue = emailOrPhone.includes('@') ? emailOrPhone.toLowerCase() : emailOrPhone;
  const user = await User.findOne({
    $or: [
      { email: normalizedValue },
      { phone: normalizedValue },
    ],
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email/phone or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email/phone or password' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    token: generateToken(user, 'user'),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: 'user',
      lastLoginAt: user.lastLoginAt,
    },
  });
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid admin email or password' });
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid admin email or password' });
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  res.json({
    token: generateToken(admin, 'admin'),
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      lastLoginAt: admin.lastLoginAt,
    },
  });
});

app.get('/api/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

app.put('/api/me', protect, async (req, res) => {
  const { name, phone, address } = req.body;

  if (!name && !phone && !address) {
    return res.status(400).json({ message: 'No profile fields to update' });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (name) user.name = String(name).trim();
  if (phone !== undefined) user.phone = phone ? String(phone).trim() : undefined;
  if (address !== undefined) user.address = address ? String(address).trim() : '';

  if (user.phone) {
    const existingUser = await User.findOne({ phone: user.phone, _id: { $ne: user._id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number is already registered' });
    }
  }

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(400).json({ message: 'Phone number is already registered' });
    }

    throw error;
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: 'user',
    },
  });
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/payments/razorpay/order', protect, async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'Payment items are required' });
  }

  try {
    let total = 49;

    for (const item of items) {
      const productId = item.productId || item.id || item._id;
      const quantity = Number(item.quantity || 1);
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({ message: 'One or more products are no longer available' });
      }

      if (quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ message: 'Product quantities must be whole numbers' });
      }

      total += product.price * quantity;
    }

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { userId: String(req.user._id) },
    });

    res.json({
      id: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ message: 'Unable to start Razorpay payment' });
  }
});

app.post('/api/products', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { name, category, description, price, image, stock, featured, tags } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ message: 'Name, category, and price are required' });
  }

  const product = await Product.create({
    name,
    category,
    description: description || '',
    price: Number(price),
    image: image || '',
    stock: Number(stock || 0),
    featured: Boolean(featured),
    tags: Array.isArray(tags) ? tags : [],
  });

  res.status(201).json(product);
});

app.put('/api/products/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { name, category, description, price, image, stock, featured, tags } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  product.name = name ?? product.name;
  product.category = category ?? product.category;
  product.description = description ?? product.description;
  product.price = price === undefined ? product.price : Number(price);
  product.image = image ?? product.image;
  product.stock = stock === undefined ? product.stock : Number(stock);
  product.featured = featured === undefined ? product.featured : Boolean(featured);
  product.tags = Array.isArray(tags) ? tags : product.tags;

  await product.save();
  res.json(product);
});

app.delete('/api/products/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Product deleted successfully' });
});

app.get('/api/admin/orders', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const orders = await Order.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

app.patch('/api/admin/orders/:id/status', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const allowedStatuses = ['Placed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status === 'Cancelled' && status !== 'Cancelled') {
    return res.status(400).json({ message: 'Cancelled orders cannot be reopened' });
  }

  if (status === 'Cancelled' && !order.stockRestored) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    order.stockRestored = true;
  }

  if (status === 'Returned' && !order.stockRestored) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    order.stockRestored = true;
  }

  order.status = status;
  await order.save();
  res.json(order);
});

app.patch('/api/admin/orders/:id/return', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { decision, note } = req.body;
  const normalizedDecision = String(decision || '').toLowerCase();

  if (!['approved', 'rejected'].includes(normalizedDecision)) {
    return res.status(400).json({ message: 'Return decision must be approved or rejected.' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!order.returnRequested) {
    return res.status(400).json({ message: 'This order has no return request to process.' });
  }

  if (normalizedDecision === 'approved') {
    if (!order.stockRestored) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
      order.stockRestored = true;
    }

    order.status = 'Returned';
    order.returnStatus = 'Approved';
    order.returnDecisionNote = note || 'Your return request has been approved and the items have been added back to stock.';
  } else {
    order.returnStatus = 'Rejected';
    order.returnDecisionNote = note || 'Your return request was not approved. Your original order remains as delivered.';
  }

  await order.save();
  res.json(order);
});

app.get('/api/orders', protect, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

app.post('/api/orders/:id/return-request', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status !== 'Delivered') {
    return res.status(400).json({ message: 'Returns can only be requested for delivered orders.' });
  }

  if (order.returnStatus === 'Approved' || order.returnStatus === 'Rejected') {
    return res.json(order);
  }

  const reason = String(req.body?.reason || '').trim();

  order.returnRequested = true;
  order.returnStatus = 'Requested';
  order.returnReason = reason;
  order.returnDecisionNote = '';
  await order.save();

  res.json(order);
});

app.patch('/api/orders/:id/cancel', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status === 'Cancelled') {
    return res.json(order);
  }

  if (order.status === 'Delivered' || order.status === 'Returned') {
    return res.status(400).json({ message: 'Delivered or returned orders cannot be cancelled' });
  }

  if (!order.stockRestored) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    order.stockRestored = true;
  }

  order.status = 'Cancelled';
  await order.save();
  res.json(order);
});

app.post('/api/orders', protect, async (req, res) => {
  const {
    items,
    total,
    shippingAddress,
    paymentMethod = 'cod',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  if (!items || !items.length || !total) {
    return res.status(400).json({ message: 'Order items and total are required' });
  }

  if (paymentMethod !== 'cod') {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Successful Razorpay payment is required' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Razorpay payment verification failed' });
    }
  }

  const normalizedItems = [];

  try {

    for (const item of items) {
      const productId = item.productId || item.id || item._id;
      const quantity = Number(item.quantity || 1);

      if (!productId) {
        throw new Error('Each cart item must include a product ID');
      }

      if (quantity < 1) {
        throw new Error('Item quantity must be at least 1');
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found for ID: ${productId}`);
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(`Only ${product.stock} units left for ${product.name}`);
      }

      normalizedItems.push({
        productId: productId,
        name: product.name,
        price: Number(product.price),
        image: product.image || item.image || '',
        quantity,
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      items: normalizedItems,
      total: Number(total),
      shippingAddress,
      paymentMethod,
      paymentId: razorpayPaymentId || '',
      paymentOrderId: razorpayOrderId || '',
      status: 'Placed',
    });

    res.status(201).json(order);
  } catch (error) {
    for (const item of normalizedItems || []) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    const message = error.message || 'Failed to create order';
    res.status(400).json({ message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. The backend is already running.`);
    process.exit(0);
  }

  console.error('Backend server failed to start:', error);
  process.exit(1);
});
