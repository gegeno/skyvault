import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  initiateUploadSchema,
  completeUploadSchema,
  getFileSchema,
  renameFileSchema,
  deleteFileSchema,
  moveFileSchema,
  copyFileSchema,
} from '../validators/file.validator.js';
import {
  initiateUpload,
  completeUpload,
  getFile,
  renameFile,
  deleteFile,
  moveFile,
  copyFile,
} from '../controllers/file.controller.js';

export const fileRouter = Router();
fileRouter.use(authMiddleware);

/**
 * @route   POST /api/v1/file/upload/initiate
 * @desc    Get a pre-signed S3 URL for uploading a new file
 */
fileRouter.post('/upload/initiate', validate(initiateUploadSchema), initiateUpload);

/**
 * @route   POST /api/v1/file/upload/complete
 * @desc    Confirm a file upload is complete and update metadata
 */
fileRouter.post('/upload/complete', validate(completeUploadSchema), completeUpload);

/**
 * @route   GET /api/v1/file/:id
 * @desc    Get a file (download/view)
 */
fileRouter.get('/:id', validate(getFileSchema), getFile);

/**
 * @route   PATCH /api/v1/file/:id
 * @desc    Rename a file
 */
fileRouter.patch('/:id', validate(renameFileSchema), renameFile);

/**
 * @route   DELETE /api/v1/file/:id
 * @desc    Delete a file
 */
fileRouter.delete('/:id', validate(deleteFileSchema), deleteFile);

/**
 * @route   PATCH /api/v1/file/:id/move
 * @desc    Move a file to a new directory
 */
fileRouter.patch('/:id/move', validate(moveFileSchema), moveFile);

/**
 * @route  PATCH /api/v1/file/:id/copy
 * @desc   Copy a file to a new directory
 * @access Private
 */
fileRouter.patch('/:id/copy', validate(copyFileSchema), copyFile);
