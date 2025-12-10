import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  if (!process.env.DB_URL) {
    logger.error('DB_URL not found in environment variables.');
    process.exit(1);
  }

  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.');
    });

    await mongoose.connect(process.env.DB_URL);
  } catch (err) {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};
