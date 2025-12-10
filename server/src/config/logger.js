import 'winston-mongodb';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, splat, json } = format;

// Define the custom text format (for Files and Console)
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

const isProd = process.env.NODE_ENV === 'production';

// Base Logger
export const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  format: combine(
    splat(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    new transports.Console({
      // Apply colorize() ONLY for Console
      format: combine(
        colorize(), 
        logFormat 
      ),
    }),
  ],
});

// Add file and MongoDB transports in production
if (isProd) {
  logger.add(
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: logFormat
    })
  );
  
  logger.add(
    new transports.File({ 
      filename: 'logs/combined.log',
      format: logFormat
    })
  );

  // MongoDB Transport: Uses JSON format
  logger.add(
    new transports.MongoDB({
      level: 'info',
      metaKey: 'metadata',
      db: process.env.DB_URL,
      tryReconnect: true,
      expireAfterSeconds: 3600 * 24 * 30, 
      collection: 'application-logs',
      format: combine(json()) 
    }),
  );
}