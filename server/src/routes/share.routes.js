import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createFileShareSchema,
  createDirectoryShareSchema,
  deleteFileShareSchema,
  deleteDirectoryShareSchema,
} from '../validators/share.validator.js';
import {
  createFileShareLink,
  createDirectoryShareLink,
  deleteFileShareLink,
  deleteDirectoryShareLink,
  getSharedByMe,
} from '../controllers/share.controller.js';

export const shareRouter = Router();
shareRouter.use(authMiddleware);

/**
 * @route   POST /api/v1/share/file/:id
 * @desc    Create or get a share link for a file
 */
shareRouter.post('/file/:id', validate(createFileShareSchema), createFileShareLink);

/**
 * @route   POST /api/v1/share/directory/:id
 * @desc    Create or get a share link for a directory
 */
shareRouter.post('/directory/:id', validate(createDirectoryShareSchema), createDirectoryShareLink);

/**
 * @route   DELETE /api/v1/share/file/:id
 * @desc    Revoke a share link for a file
 */
shareRouter.delete('/file/:id', validate(deleteFileShareSchema), deleteFileShareLink);

/**
 * @route   DELETE /api/v1/share/directory/:id
 * @desc    Revoke a share link for a directory
 */
shareRouter.delete(
  '/directory/:id',
  validate(deleteDirectoryShareSchema),
  deleteDirectoryShareLink,
);

/**
 * @route   GET /api/v1/share/me
 * @desc    Get all items shared by me
 */
shareRouter.get('/me', getSharedByMe);
