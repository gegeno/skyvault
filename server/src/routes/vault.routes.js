import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { setupVaultSchema, unlockVaultSchema } from '../validators/vault.validator.js';
import { setupVault, unlockVault, lockVault } from '../controllers/vault.controller.js';

export const vaultRouter = Router();
vaultRouter.use(authMiddleware);

/**
 * @route   POST /api/v1/vault/setup
 * @desc    Set up the secure vault for the first time
 */
vaultRouter.post('/setup', validate(setupVaultSchema), setupVault);

/**
 * @route   POST /api/v1/vault/unlock
 * @desc    Unlock the secure vault by providing the PIN
 */
vaultRouter.post('/unlock', validate(unlockVaultSchema), unlockVault);

/**
 * @route   POST /api/v1/vault/lock
 * @desc    Lock the secure vault
 */
vaultRouter.post('/lock', lockVault);
