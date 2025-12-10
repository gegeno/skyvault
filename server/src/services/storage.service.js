import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { Directory } from '../models/directory.model.js';

/**
 * Recursively updates the size of all parent directories by a delta.
 * @param {mongoose.Types.ObjectId | string} startingDirId - The ID of the directory where the change occurred.
 * @param {number} deltaSize - The change in size (positive for add, negative for delete).
 */
export const updateDirectorySize = async (startingDirId, deltaSize) => {
  // No need to do anything if size hasn't changed
  if (deltaSize === 0) {
    logger.debug('Skipping size update as delta is 0.');
    return;
  }

  let currentDirId = startingDirId;

  try {
    // Loop traverses up the directory tree
    while (currentDirId) {
      const updatedDir = await Directory.findByIdAndUpdate(
        currentDirId,
        { $inc: { size: deltaSize } },
        { new: true },
      );

      if (!updatedDir) {
        logger.warn(
          `Data integrity issue: Could not find directory ${currentDirId} while updating size. Stopping traversal.`,
        );
        break; // Stop the loop if a parent is missing
      }
      currentDirId = updatedDir.parentDirectory;
    }
  } catch (error) {
    logger.error(`Fatal error during directory size update starting from ${startingDirId}:`, error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update storage size.');
  }
};
