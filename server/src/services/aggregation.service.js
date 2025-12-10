import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { File } from '../models/file.model.js';
import { Directory } from '../models/directory.model.js';

/**
 * Recursively finds all descendant directories and files for a given directory.
 * @param {string} directoryId - The ID of the root directory to start searching from.
 * @param {string} ownerId - The ID of the user who owns the directory.
 * @returns {Promise<{dirs: Array, files: Array}>} - Object containing arrays of nested directories and files.
 */
export const getAllDescendants = async (directoryId, ownerId) => {
  const dirObjectId = new mongoose.Types.ObjectId(directoryId);
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const rootDir = await Directory.findOne({
    _id: dirObjectId,
    owner: ownerObjectId,
  }).lean();

  if (!rootDir) {
    logger.warn(`Directory ${directoryId} not found or unauthorized.`);
    return { dirs: [], files: [] };
  }

  const dirs = [];
  const queue = [dirObjectId];

  // Travers to gather all directories
  while (queue.length > 0) {
    const currentId = queue.shift();

    // Get direct children
    const children = await Directory.find({
      parentDirectory: currentId,
      owner: ownerObjectId,
    }).lean();

    for (const child of children) {
      dirs.push(child);
      queue.push(child._id);
    }
  }

  // Collect all directory IDs for file search
  const dirIds = [dirObjectId, ...dirs.map((d) => d._id)];

  // Get all files inside any descendant directory
  const files = await File.find({
    parentDirectory: { $in: dirIds },
    owner: ownerObjectId,
  }).lean();

  logger.debug(
    `Found ${dirs.length} sub-directories and ${files.length} files under ${directoryId}`,
  );

  return { dirs, files };
};
