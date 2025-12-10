import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import { File } from '../models/file.model.js';
import { Directory } from '../models/directory.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Checks if a given file or directory is inside the user's secure vault.
 * @param {string} itemId - The ID of the file or directory to check.
 * @param {'file' | 'directory'} itemType - The type of the item.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{isInVault: boolean, rootVaultDirId: string | null}>}
 */
export const checkItemVaultStatus = async (itemId, itemType, userId) => {
  // Get the user and their vault info
  const user = await User.findById(userId).select('rootVaultDirectory hasVault').lean();

  // If user has no vault, item can't be in it.
  if (!user || !user.hasVault || !user.rootVaultDirectory) {
    return { isInVault: false, rootVaultDirId: null };
  }

  const rootVaultDirId = user.rootVaultDirectory.toString();

  // Get the item
  let item;
  if (itemType === 'file') {
    item = await File.findById(itemId).lean();
  } else {
    item = await Directory.findById(itemId).lean();
  }

  if (!item) {
    return { isInVault: false, rootVaultDirId: rootVaultDirId };
  }

  // Check if the item is the vault root directory
  if (item._id.toString() === rootVaultDirId) {
    return { isInVault: true, rootVaultDirId: rootVaultDirId };
  }

  // Trace the item's parent up to the root
  let currentParentId = item.parentDirectory;

  while (currentParentId) {
    if (currentParentId.toString() === rootVaultDirId) {
      return { isInVault: true, rootVaultDirId: rootVaultDirId };
    }

    // Get the next parent
    const parent = await Directory.findById(currentParentId).lean();

    // If parent is missing or hit the main root, stop.
    if (!parent || !parent.parentDirectory) {
      break;
    }

    currentParentId = parent.parentDirectory;
  }

  return { isInVault: false, rootVaultDirId: rootVaultDirId };
};

/**
 * Helper to check vault access for a given item.
 * @param {object} req - The request object containing user info.
 * @param {mongoose.Document | object} item - The file or directory document.
 * @param {'file' | 'directory'} itemType - The type of the item.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<{isInVault: boolean, rootVaultDirId: string | null}>}
 * @throws {ApiError} - Throws if the item is in the vault and the vault is locked.
 */
export const checkVaultAccess = async (req, item, itemType, userId) => {
  if (!item) {
    // Handle cases where item might be null (root directory)
    return { isInVault: false, rootVaultDirId: null };
  }
  const { isInVault, rootVaultDirId } = await checkItemVaultStatus(item._id, itemType, userId);

  if (isInVault && !req.user.isVaultUnlocked) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Item is in the Secure Vault. Please unlock your vault to proceed.',
    );
  }
  return { isInVault, rootVaultDirId };
};

/**
 * A helper to quickly check if a directory (by ID) is or is in the vault.
 * @param {string} dirId - The ID of the directory to check.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<boolean>}
 */
export const isDirectoryInVault = async (dirId, userId) => {
  const { isInVault } = await checkItemVaultStatus(dirId, 'directory', userId);
  return isInVault;
};
