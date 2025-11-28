const mongoose = require('mongoose');

async function connect() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

module.exports = {
  connect,
  JWT_SECRET: process.env.JWT_SECRET,
};
