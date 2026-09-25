const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'Placed',
      enum: ['Placed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    },
    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnStatus: {
      type: String,
      default: 'None',
      enum: ['None', 'Requested', 'Approved', 'Rejected'],
    },
    returnReason: {
      type: String,
      default: '',
    },
    returnDecisionNote: {
      type: String,
      default: '',
    },
    stockRestored: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      default: 'cod',
    },
    paymentId: {
      type: String,
      default: '',
    },
    paymentOrderId: {
      type: String,
      default: '',
    },
    shippingAddress: {
      email: String,
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
