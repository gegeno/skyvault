import app from './app.js';
import { logger } from './config/logger.js';
import { connectDB } from './config/db.js';
import { redisClient } from './config/redis.js';

// Environment variables
const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const SERVER_URL = ENV === 'production' ? process.env.SERVER_URL_PROD : process.env.SERVER_URL_DEV;

// exit if environment variables are not defined
if (!ENV || !PORT || !SERVER_URL) {
  logger.error('Environment variables are not defined.');
  process.exit(1);
}

// Main async function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the Express server
    app.listen(PORT, () => {
      logger.info(`Environment: ${ENV}`);
      logger.info(`Server running on port: ${PORT}`);
      logger.info(`Access at: ${SERVER_URL}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  try {
    // Disconnect Redis
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis client disconnected.');
    }
    logger.info('Shutdown complete. Exiting process.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start the server
startServer();
