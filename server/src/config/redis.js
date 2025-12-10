import { createClient } from 'redis';
import { logger } from './logger.js';

// Redis Client Configuration
export const redisClient = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Connection Event Listeners
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});
redisClient.on('ready', () => {
  logger.info('Redis client connected successfully and ready to use.');
});
redisClient.on('error', (err) => {
  logger.error(`Redis client error: ${err}`);
});
redisClient.on('end', () => {
  logger.warn('Redis client disconnected.');
});

// Initial Connection
redisClient.connect().catch((err) => {
  logger.error('Failed to connect to Redis on initial import:', err);
});
