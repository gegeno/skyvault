import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';

// A custom JSON handler for when a rate limit is exceeded
const rateLimitHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    success: false,
    message: options.message,
    errors: [],
    data: null,
  });
};

// Rate Limiter Middlewares for authentication routes
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (cmd, ...args) => redisClient.sendCommand([cmd, ...args]),
    prefix: 'rl:auth:', // Unique prefix for this limiter
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message:
    'Too many login or password reset attempts from this IP. Please try again in 15 minutes.',
  handler: rateLimitHandler,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Rate Limiter Middlewares for public-facing routes
export const publicLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (cmd, ...args) => redisClient.sendCommand([cmd, ...args]),
    prefix: 'rl:public:', // Unique prefix for this limiter
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
  message: 'Too many requests to public links from this IP. Please slow down.',
  handler: rateLimitHandler,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Rate Limiter Middlewares for general API routes
export const generalApiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (cmd, ...args) => redisClient.sendCommand([cmd, ...args]),
    prefix: 'rl:general:', // Unique prefix for this limiter
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: 'Too many requests. Please slow down.',
  handler: rateLimitHandler,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
