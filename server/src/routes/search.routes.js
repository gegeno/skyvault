import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { searchSchema } from '../validators/search.validator.js';
import { searchAll } from '../controllers/search.controller.js';

export const searchRouter = Router();
searchRouter.use(authMiddleware);

/**
 * @route   GET /api/v1/search
 * @desc    Search for files and directories
 */
searchRouter.get('/', validate(searchSchema), searchAll);
