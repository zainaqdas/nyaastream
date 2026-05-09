const mongoose = require('mongoose');
const { createClient } = require('redis');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nyaapi';
    
    // Diagnostic log (Masked)
    const maskedURI = mongoURI.replace(/:([^@]+)@/, ':***@');
    console.log(`Connecting to MongoDB with URI: ${maskedURI}`);

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err; // Throw instead of exiting process for better serverless handling
  }
};

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis Connected...');
  } catch (err) {
    console.error('Redis connection error:', err.message);
  }
};

module.exports = { connectDB, redisClient, connectRedis };
