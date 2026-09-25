const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const adminExists = await Admin.findOne({ email: 'admin@shoppingwebsite.com' });

  if (!adminExists) {
    const admin = await Admin.create({
      name: 'Website Admin',
      email: 'admin@shoppingwebsite.com',
      password: 'admin123',
    });
    console.log('Seed admin created:', admin.email);
  } else {
    console.log('Admin already exists');
  }
};

const seedDebugUser = async () => {
  await connectDB();

  const userExists = await User.findOne({ email: 'debug@example.com' });

  if (!userExists) {
    const user = await User.create({
      name: 'Debug User',
      email: 'debug@example.com',
      password: 'pass123',
    });
    console.log('Seed debug user created:', user.email);
  } else {
    console.log('Debug user already exists');
  }
};

const seedProducts = async () => {
  await connectDB();

  const products = [
    { name: 'Classic Leather Backpack', category: 'men', description: 'A stylish everyday backpack built for commuting and travel.', price: 109.95, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', stock: 25, featured: true, tags: ['backpack','travel','new'] },
    { name: 'Urban Street Tee', category: 'men', description: 'Soft cotton comfort with a classic casual silhouette.', price: 22.3, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', stock: 50, featured: true, tags: ['tee','casual','sale'] },
    { name: 'Signature Cotton Polo', category: 'men', description: 'A breathable premium knit polo that balances comfort and smart styling.', price: 39.99, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80', stock: 32, featured: true, tags: ['polo','smart','classic'] },
    { name: 'Layered Utility Jacket', category: 'men', description: 'A versatile utility jacket with a lightweight feel and timeless silhouette.', price: 88.5, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', stock: 20, featured: true, tags: ['jacket','utility','outerwear'] },
    { name: 'Everyday Denim', category: 'men', description: 'Strong, comfortable denim cut for everyday wear and easy styling.', price: 58.0, image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80', stock: 28, featured: false, tags: ['denim','casual','essential'] },
    { name: 'Summit Wool Overshirt', category: 'men', description: 'A warm yet breathable overshirt for crisp mornings and layered looks.', price: 98.5, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', stock: 22, featured: true, tags: ['overshirt','layering','wool'] },
    { name: 'Metro Runner Sneaker', category: 'men', description: 'Built for everyday miles with soft cushioning and a clean finish.', price: 74.0, image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80', stock: 26, featured: true, tags: ['sneaker','sport','daily'] },
    { name: 'Classic Bomber Jacket', category: 'men', description: 'Lightweight layering essential designed for cool evenings and effortless styling.', price: 89.99, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', stock: 18, featured: false, tags: ['jacket','bomber','classic'] },
    { name: 'Premium Knit Polo', category: 'men', description: 'Tailored comfort with a premium knit finish for relaxed polished looks.', price: 64.0, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80', stock: 31, featured: true, tags: ['polo','premium','smart'] },
    { name: 'Leather Weekend Travel Tote', category: 'men', description: 'A roomy and polished tote for office days, weekends, and short trips.', price: 79.0, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', stock: 24, featured: false, tags: ['tote','travel','leather'] },

    { name: 'Soft Knit Top', category: 'women', description: 'A lightweight, flattering piece made for easy daily styling.', price: 22.3, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', stock: 40, featured: true, tags: ['women','top','new'] },
    { name: 'Sunset Silk Dress', category: 'women', description: 'An effortlessly elegant silhouette for dinners, events, and afternoon plans.', price: 87.0, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', stock: 19, featured: true, tags: ['dress','silk','occasion'] },
    { name: 'Cloud Knit Cardigan', category: 'women', description: 'A brushed knit layer that keeps style relaxed and cozy throughout the day.', price: 74.0, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', stock: 24, featured: true, tags: ['cardigan','knit','layering'] },
    { name: 'Mini Crossbody', category: 'women', description: 'A compact everyday bag designed for convenience and polished styling.', price: 42.0, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', stock: 29, featured: false, tags: ['bag','crossbody','day'] },
    { name: 'Statement Sunglasses', category: 'women', description: 'A bold accessory that finishes outfits with instant personality.', price: 31.0, image: 'https://images.unsplash.com/photo-1577803947579-9f7e1c8a3d80?auto=format&fit=crop&w=900&q=80', stock: 34, featured: false, tags: ['accessories','sun','fashion'] },
    { name: 'Sculpted Everyday Dress', category: 'women', description: 'A clean, flattering dress that transitions smoothly from day to night.', price: 69.95, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', stock: 21, featured: false, tags: ['dress','classic','tailored'] },
    { name: 'Weekend Tote', category: 'women', description: 'Spacious and polished for workdays, travel, and everyday errands.', price: 49.0, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', stock: 24, featured: false, tags: ['bag','tote','daily'] },
    { name: 'Classic Trench Coat', category: 'women', description: 'A refined trench layer that sharpens everyday looks without feeling heavy.', price: 55.99, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', stock: 16, featured: true, tags: ['coat','classic','layering'] },
    { name: 'Rose Gold Watch', category: 'women', description: 'A chic everyday timepiece with a refined finish.', price: 110.0, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', stock: 20, featured: false, tags: ['watch','luxury','accessory'] },
    { name: 'City Light Bag', category: 'women', description: 'A structured crossbody designed for daily commute and travel.', price: 58.0, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', stock: 18, featured: true, tags: ['bag','commute','city'] },

    { name: 'Adventure Backpack', category: 'kids', description: 'Durable and cheerful backpack for school and play.', price: 34.99, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80', stock: 30, featured: true, tags: ['kids','school','fun'] },
    { name: 'Playful Graphic Tee', category: 'kids', description: 'Bright, comfortable, and easy to wear for all-day movement.', price: 18.5, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', stock: 45, featured: true, tags: ['kids','graphic','play'] },
    { name: 'Cotton Zip Hoodie', category: 'kids', description: 'Soft fleece interior and an easy fit designed for warmth and comfort.', price: 29.99, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', stock: 36, featured: true, tags: ['hoodie','warm','kids'] },
    { name: 'Junior Sneaker Pair', category: 'kids', description: 'A lightweight, flexible pair built for playgrounds and everyday runs.', price: 36.0, image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80', stock: 18, featured: false, tags: ['shoes','sport','active'] },
    { name: 'Dino Explorer Backpack', category: 'kids', description: 'A durable, playful daypack with room for lunch, art supplies, and extras.', price: 39.5, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80', stock: 20, featured: true, tags: ['kids','dino','school'] },
    { name: 'Build & Play Blocks', category: 'kids', description: 'A colorful building set designed for creative play and gentle learning.', price: 26.0, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', stock: 27, featured: true, tags: ['kids','play','learning'] },
    { name: 'Kids Rain Shell', category: 'kids', description: 'A weather-ready shell with a lightweight feel and cheerful style.', price: 42.0, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', stock: 16, featured: false, tags: ['kids','rain','outerwear'] },
    { name: 'Storybook Set', category: 'kids', description: 'An engaging reading set for bedtime stories and creative time at home.', price: 24.0, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', stock: 32, featured: false, tags: ['books','reading','kids'] },
    { name: 'Soft Plush Toy', category: 'kids', description: 'A soft playful companion that brings comfort and joy.', price: 19.99, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80', stock: 29, featured: false, tags: ['toy','soft','kids'] },
    { name: 'Play Mat', category: 'kids', description: 'A cushioned play mat designed for safe and imaginative fun.', price: 58.0, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', stock: 14, featured: true, tags: ['play','mat','activity'] },

    { name: 'Glow Serum', category: 'beauty', description: 'A lightweight glow-boosting serum for daily hydration.', price: 28.0, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80', stock: 18, featured: true, tags: ['beauty','serum','skincare'] },
    { name: 'Silk Face Cream', category: 'beauty', description: 'Daily nourishment with a smooth finish and rich hydration.', price: 32.5, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', stock: 14, featured: true, tags: ['beauty','cream','hydration'] },
    { name: 'Hydrating Mist', category: 'beauty', description: 'A refreshing veil of hydration for an instant, dewy finish.', price: 19.8, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80', stock: 22, featured: true, tags: ['mist','refresh','glow'] },
    { name: 'Velvet Body Oil', category: 'beauty', description: 'Nourishing body oil with a soft, silky finish and warm scent.', price: 27.9, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', stock: 17, featured: false, tags: ['bodycare','hydration','luxury'] },
    { name: 'Night Repair Mask', category: 'beauty', description: 'A calming overnight mask that helps restore moisture and softness.', price: 35.5, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80', stock: 16, featured: false, tags: ['mask','night','repair'] },
    { name: 'Citrus Glow Scrub', category: 'beauty', description: 'A brightening exfoliator that smooths and revives tired skin.', price: 24.9, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', stock: 21, featured: true, tags: ['scrub','brightening','glow'] },
    { name: 'Dewy Eye Serum', category: 'beauty', description: 'Refines the eye area with a cushiony, lightweight finish.', price: 29.5, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80', stock: 15, featured: true, tags: ['serum','eyes','dewy'] },
    { name: 'Soft Cleanser', category: 'beauty', description: 'A gentle formula that refreshes skin without over-drying.', price: 21.0, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80', stock: 25, featured: false, tags: ['cleanser','gentle','daily'] },
    { name: 'Tinted Lip Balm', category: 'beauty', description: 'A nourishing lip finish with a soft tint and glossy feel.', price: 16.3, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80', stock: 28, featured: false, tags: ['lip','balm','tint'] },
    { name: 'Rose Water Toner', category: 'beauty', description: 'A refreshing toner that softens and smooths the skin.', price: 23.4, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80', stock: 19, featured: true, tags: ['toner','rose','hydration'] },

    { name: 'Minimal Accent Chair', category: 'living', description: 'A simple and elegant accent chair to refresh your room.', price: 230.0, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', stock: 12, featured: true, tags: ['living','chair','home'] },
    { name: 'Soft Throw Blanket', category: 'living', description: 'An ultra-soft layer that adds warmth and texture to any room.', price: 58.0, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', stock: 30, featured: true, tags: ['blanket','cozy','decor'] },
    { name: 'Tabletop Aroma Diffuser', category: 'living', description: 'A subtle home accent that brings aroma and calm to everyday routines.', price: 44.0, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80', stock: 19, featured: true, tags: ['diffuser','home','calm'] },
    { name: 'Natural Woven Basket', category: 'living', description: 'A warm, textured basket that keeps your space tidy and stylish.', price: 33.5, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80', stock: 23, featured: false, tags: ['basket','storage','natural'] },
    { name: 'Ceramic Table Lamp', category: 'living', description: 'A soft-glow statement lamp that adds warmth to any corner.', price: 61.5, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80', stock: 15, featured: false, tags: ['lamp','lighting','decor'] },
    { name: 'Round Coffee Table', category: 'living', description: 'A refined centerpiece for living rooms with a modern yet warm aesthetic.', price: 180.0, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80', stock: 10, featured: true, tags: ['table','living','modern'] },
    { name: 'Storage Bench', category: 'living', description: 'A smart blend of form and function for clutter-free living spaces.', price: 96.0, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', stock: 13, featured: true, tags: ['bench','storage','living'] },
    { name: 'Linen Cushion Set', category: 'living', description: 'Layered softness and texture that instantly freshens a room.', price: 39.0, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', stock: 21, featured: false, tags: ['cushions','linen','decor'] },
    { name: 'Wooden Wall Shelf', category: 'living', description: 'A minimal wall shelf that adds display space and clean lines.', price: 72.0, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80', stock: 17, featured: false, tags: ['shelf','wood','storage'] },
    { name: 'Indoor Plant Pot', category: 'living', description: 'A stylish planter that brings a fresh, calming touch to the home.', price: 28.0, image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80', stock: 23, featured: true, tags: ['plant','pot','home'] }
  ];

  const productsWithStandardStock = products.map((product) => ({ ...product, stock: 10 }));
  const existingCount = await Product.countDocuments();
  await Product.deleteMany({});
  await Product.insertMany(productsWithStandardStock);
  console.log(`Seeded ${productsWithStandardStock.length} products with stock set to 10. Previous count was ${existingCount}.`);
};

const run = async () => {
  try {
    await seedAdmin();
    await seedDebugUser();
    await seedProducts();
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

run();
