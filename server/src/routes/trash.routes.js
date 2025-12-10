import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { permanentDeleteSchema, emptyTrashSchema } from '../validators/trash.validator.js';
import {
  permanentDeleteFile,
  permanentDeleteDirectory,
  emptyTrash,
} from '../controllers/trash.controller.js';

export const trashRouter = Router();
trashRouter.use(authMiddleware);

/**
 * @route   DELETE /api/v1/trash/permanent/file/:id
 * @desc    Permanently delete a file
 */
trashRouter.delete('/permanent/file/:id', validate(permanentDeleteSchema), permanentDeleteFile);

/**
 * @route   DELETE /api/v1/trash/permanent/directory/:id
 * @desc    Permanently delete a directory
 */
trashRouter.delete(
  '/permanent/directory/:id',
  validate(permanentDeleteSchema),
  permanentDeleteDirectory,
);

/**
 * @route   DELETE /api/v1/trash/empty
 * @desc    Empty the entire trash
 */
trashRouter.delete('/empty', validate(emptyTrashSchema), emptyTrash);
