import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Directory } from '../models/directory.model.js';
import { File } from '../models/file.model.js';
import { checkItemVaultStatus } from '../services/vault.service.js';

/**
 * @desc    Search files and directories
 * @route   GET /api/v1/search
 * @access  Private
 */
export const searchAll = async (req, res) => {
  const { q } = req.query;
  const { userId, rootTrashDirectoryId, isVaultUnlocked } = req.user;

  // Define the base query for the database
  const query = {
    owner: userId,
    name: { $regex: q, $options: 'i' },
    parentDirectory: { $ne: rootTrashDirectoryId },
    status: { $ne: 'pending' },
  };

  // Run the search queries in parallel
  const [fileResults, dirResults] = await Promise.all([
    File.find(query).lean(),
    Directory.find(query).lean(),
  ]);

  // Combine results for filtering
  const allResults = [...fileResults, ...dirResults];

  // Filter results (Vault & Nested Trash checks)
  const filterPromises = allResults.map(async (item) => {
    const itemType = 'size' in item ? 'file' : 'directory';

    // Check Vault Status
    const { isInVault } = await checkItemVaultStatus(item._id, itemType, userId);

    // If item is in the vault AND the vault is locked, filter it out
    if (isInVault && !isVaultUnlocked) {
      return null;
    }

    return item;
  });

  const filteredResults = (await Promise.all(filterPromises)).filter(Boolean);

  // Separate the filtered results back into files and directories
  const finalFiles = filteredResults.filter((item) => 'size' in item);
  const finalDirectories = filteredResults.filter((item) => !('size' in item));

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, 'Search results retrieved', {
      files: finalFiles,
      directories: finalDirectories,
    }),
  );
};
