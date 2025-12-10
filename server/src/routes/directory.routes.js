import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getDirectorySchema,
  createDirectorySchema,
  renameDirectorySchema,
  deleteDirectorySchema,
  moveDirectorySchema,
  copyDirectorySchema,
} from '../validators/directory.validator.js';
import {
  getDirectory,
  createDirectory,
  renameDirectory,
  deleteDirectory,
  moveDirectory,
  copyDirectory,
} from '../controllers/directory.controller.js';

export const directoryRouter = Router();
directoryRouter.use(authMiddleware);

/**
 * @route   GET /api/v1/directory/:id?
 * @desc    Get a directory's contents (sub-dirs and files)
 */
directoryRouter.get('/', validate(getDirectorySchema), getDirectory);
directoryRouter.get('/:id', validate(getDirectorySchema), getDirectory);

/**
 * @route   POST /api/v1/directory
 * @desc    Create a new directory
 */
directoryRouter.post('/', validate(createDirectorySchema), createDirectory);

/**
 * @route   PATCH /api/vit/directory/:id
 * @desc    Rename a directory
 */
directoryRouter.patch('/:id', validate(renameDirectorySchema), renameDirectory);

/**
 * @route   DELETE /api/v1/directory/:id
 * @desc    Delete a directory
 */
directoryRouter.delete('/:id', validate(deleteDirectorySchema), deleteDirectory);

/**
 * @route   PATCH /api/v1/directory/:id/move
 * @desc    Move a directory to a new parent
 */
directoryRouter.patch('/:id/move', validate(moveDirectorySchema), moveDirectory);

/**
 * @route   PATCH /api/v1/directory/:id/copy
 * @desc    Copy a directory to a new parent
 */
directoryRouter.patch('/:id/copy', validate(copyDirectorySchema), copyDirectory);
