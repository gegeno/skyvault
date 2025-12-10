import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { getPublicShareSchema, downloadPublicFileSchema } from '../validators/share.validator.js';
import {
  getPublicShareDetails,
  downloadPublicFile,
} from '../controllers/publicShare.controller.js';

export const publicShareRouter = Router();

/**
 * @route   GET /api/v1/public/share/:shareId
 * @desc    Get details of a shared file or directory
 */
publicShareRouter.get('/share/:shareId', validate(getPublicShareSchema), getPublicShareDetails);

/**
 * @route   GET /api/v1/public/download/:shareId
 * @desc    Download a shared file
 */
publicShareRouter.get('/download/:shareId', validate(downloadPublicFileSchema), downloadPublicFile);
