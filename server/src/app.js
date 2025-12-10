import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { logger } from './config/logger.js';
import { globalErrorHandler } from './middlewares/errorHandler.middleware.js';
import { ApiError } from './utils/ApiError.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { directoryRouter } from './routes/directory.routes.js';
import { fileRouter } from './routes/file.routes.js';
import { shareRouter } from './routes/share.routes.js';
import { publicShareRouter } from './routes/publicShare.routes.js';
import { vaultRouter } from './routes/vault.routes.js';
import { trashRouter } from './routes/trash.routes.js';
import { searchRouter } from './routes/search.routes.js';
import {
  authLimiter,
  publicLimiter,
  generalApiLimiter,
} from './middlewares/rateLimit.middleware.js';

// Environment variables
const ENV = process.env.NODE_ENV;
const CLIENT_URL = ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

const app = express();

// Security headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  }),
);

// Body parsers & Cookie parser
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

// HTTP request logger with Morgan
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan('dev', { stream: morganStream }));

// API Router
const apiRouter = express.Router();

// Apply rate limiters only in production
if (ENV === 'production') {
  // Apply the strictest limiters to specific, high-risk routes first
  apiRouter.use('/auth', authLimiter);
  apiRouter.use('/public', publicLimiter);

  // Apply a general, more lenient limiter to all other API routes
  apiRouter.use('/', generalApiLimiter);
  logger.info('Rate Limiters are Available.')
}

// Mount all routes
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/directory', directoryRouter);
apiRouter.use('/file', fileRouter);
apiRouter.use('/share', shareRouter);
apiRouter.use('/public', publicShareRouter);
apiRouter.use('/vault', vaultRouter);
apiRouter.use('/trash', trashRouter);
apiRouter.use('/search', searchRouter);

// Register the v1 router
app.use('/api/v1', apiRouter);

// 404 handler for undefined routes
app.use(/.*/, (req, res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, `Route not found: ${req.originalUrl}`));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
