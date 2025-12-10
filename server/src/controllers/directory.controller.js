import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Directory } from '../models/directory.model.js';
import { File } from '../models/file.model.js';
import { User } from '../models/user.model.js';
import { ShareLink } from '../models/shareLink.model.js';
import { copyFileInternal } from './file.controller.js';
import { deleteS3Files } from '../services/s3.service.js';
import { updateDirectorySize } from '../services/storage.service.js';
import { checkItemVaultStatus, checkVaultAccess } from '../services/vault.service.js';
import { getAllDescendants } from '../services/aggregation.service.js';

/**
 * @desc    Get a directory's contents (sub-dirs and files)
 * @route   GET /api/v1/directory/:id?
 * @access  Private
 */
export const getDirectory = async (req, res) => {
  const { userId, rootDirectoryId } = req.user;

  // Get target directory
  const targetDirId = req.params.id || rootDirectoryId;

  // Get directory info
  const directoryInfo = await Directory.findOne({
    _id: targetDirId,
    owner: userId,
  }).lean();

  if (!directoryInfo) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Directory not found or you do not have access.');
  }

  // Vault Check
  await checkVaultAccess(req, directoryInfo, 'directory', userId);

  // Get children
  const [subDirectories, files] = await Promise.all([
    Directory.find({
      parentDirectory: targetDirId,
      owner: userId,
    }).lean(),
    File.find({
      parentDirectory: targetDirId,
      owner: userId,
      status: { $ne: 'pending' },
    }).lean(),
  ]);

  // Combine and send
  const data = {
    ...directoryInfo,
    directories: subDirectories,
    files: files,
  };

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Directory contents retrieved', data));
};

/**
 * @desc    Create a new directory
 * @route   POST /api/v1/directory
 * @access  Private
 */
export const createDirectory = async (req, res) => {
  const { name, parentId } = req.body;
  const { userId, rootDirectoryId } = req.user;

  // Get parent
  const parentDirId = parentId || rootDirectoryId;

  const parentDir = await Directory.findOne({
    _id: parentDirId,
    owner: userId,
  });

  if (!parentDir) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'The parent directory does not exist or you do not have access.',
    );
  }

  // Vault Check
  await checkVaultAccess(req, parentDir, 'directory', userId);

  // Create the new directory
  const newDirectory = new Directory({
    name: name,
    owner: userId,
    parentDirectory: parentDir._id,
  });

  await newDirectory.save();

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, 'Directory created successfully', newDirectory));
};

/**
 * @desc    Rename a directory
 * @route   PATCH /api/v1/directory/:id
 * @access  Private
 */
export const renameDirectory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { userId } = req.user;

  // Find and update
  const updatedDirectory = await Directory.findOneAndUpdate(
    {
      _id: id,
      owner: userId,
    },
    { $set: { name: name } },
    { new: true },
  );

  if (!updatedDirectory) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Directory not found or you do not have access to rename it.',
    );
  }

  // Vault Check
  await checkVaultAccess(req, updatedDirectory, 'directory', userId);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Directory renamed successfully', updatedDirectory));
};

/**
 * @desc    Move a directory to the trash
 * @route   DELETE /api/v1/directory/:id
 * @access  Private
 */
export const deleteDirectory = async (req, res) => {
  const { id: dirId } = req.params;
  const { userId, rootDirectoryId, rootTrashDirectoryId } = req.user;

  if (dirId === rootDirectoryId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You cannot delete your root directory.');
  }

  const user = await User.findById(userId).select('rootVaultDirectory');
  if (dirId === user.rootVaultDirectory?.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot delete the Secure Vault root.');
  }
  if (dirId === rootTrashDirectoryId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Cannot delete the Trash root. Please use the 'Empty Trash' action.",
    );
  }

  // Find directory
  const dirToMove = await Directory.findOne({
    _id: dirId,
    owner: userId,
  });

  if (!dirToMove) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Directory not found.');
  }

  // Vault Check
  await checkVaultAccess(req, dirToMove, 'directory', userId);

  // Check if already in trash
  const oldParentId = dirToMove.parentDirectory;
  if (oldParentId.toString() === rootTrashDirectoryId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Directory is already in the trash.');
  }

  // Start transaction to move to trash and update sizes
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update sizes
    await Promise.all([
      updateDirectorySize(oldParentId, -dirToMove.size, { session }),
      updateDirectorySize(rootTrashDirectoryId, dirToMove.size, { session }),
    ]);

    // Update parent
    dirToMove.parentDirectory = rootTrashDirectoryId;
    await dirToMove.save({ session });

    // Revoke share links for the directory and all its contents
    const { files } = await getAllDescendants(dirId, userId);
    const fileIds = files.map((f) => f._id);
    await ShareLink.deleteMany(
      {
        owner: userId,
        $or: [{ file: { $in: fileIds } }, { directory: dirId }],
      },
      { session },
    );

    // Commit transaction
    await session.commitTransaction();

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Directory moved to trash successfully', dirToMove));
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to move directory ${dirId} to trash:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while moving the directory to trash.',
    );
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Move a directory to a new directory
 * @route   PATCH /api/v1/directory/:id/move
 * @access  Private
 */
export const moveDirectory = async (req, res) => {
  const { id: dirId } = req.params;
  let { newParentId } = req.body;
  const { userId, rootDirectoryId } = req.user;

  if (newParentId === null) {
    newParentId = rootDirectoryId;
  }

  // Find items
  const [dirToMove, newParentDir, user] = await Promise.all([
    Directory.findOne({ _id: dirId, owner: userId }),
    Directory.findOne({ _id: newParentId, owner: userId }),
    User.findById(userId).select('rootVaultDirectory hasVault'),
  ]);

  // Validate found items
  if (!dirToMove) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Directory not found.');
  }
  if (!newParentDir) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Target directory not found.');
  }

  // Vault Checks
  await checkVaultAccess(req, dirToMove, 'directory', userId);
  const { isInVault: isTargetInVault } = await checkItemVaultStatus(
    newParentDir._id,
    'directory',
    userId,
  );

  if (isTargetInVault && !req.user.isVaultUnlocked) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Cannot move item to a locked vault. Please unlock your vault.',
    );
  }

  const oldParentId = dirToMove.parentDirectory;

  // Important checks before moving
  if (dirId === newParentId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot move a directory into itself.');
  }
  if (oldParentId && oldParentId.toString() === newParentId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Directory is already in this location.');
  }
  if (dirToMove._id.toString() === rootDirectoryId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot move the root directory.');
  }
  if (dirToMove._id.toString() === user.rootVaultDirectory?.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot move the Secure Vault root.');
  }
  if (dirToMove._id.toString() === user.rootTrashDirectory?.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot move the Trash root.');
  }

  // Cycle Prevention
  let currentParentId = newParentDir._id;
  while (currentParentId) {
    if (currentParentId.toString() === dirId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot move a directory into one of its own sub-directories.',
      );
    }
    const parent = await Directory.findById(currentParentId).lean();
    currentParentId = parent ? parent.parentDirectory : null;
  }

  // Start transaction to move items and update sizes
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update sizes
    await Promise.all([
      updateDirectorySize(oldParentId, -dirToMove.size, { session }),
      updateDirectorySize(newParentId, dirToMove.size, { session }),
    ]);

    // Update parent
    dirToMove.parentDirectory = newParentId;
    await dirToMove.save({ session });

    // If moving to vault, revoke share links
    if (isTargetInVault) {
      const { files } = await getAllDescendants(dirId, userId);
      const fileIds = files.map((f) => f._id);
      await ShareLink.deleteMany(
        {
          owner: userId,
          $or: [
            { file: { $in: fileIds } },
            { directory: dirId }, // The directory itself
          ],
        },
        { session },
      );
    }

    // Commit transaction
    await session.commitTransaction();

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Directory moved successfully', dirToMove));
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to move directory ${dirId}:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while moving the directory.',
    );
  } finally {
    session.endSession();
  }
};

// Recursive helper for copying directories
const recursiveCopy = async (originalDir, newParentDir, userId, session) => {
  let s3KeysCreated = [];
  let totalSize = 0;

  const [files, subDirs] = await Promise.all([
    File.find({ parentDirectory: originalDir._id, owner: userId }),
    Directory.find({ parentDirectory: originalDir._id, owner: userId }),
  ]);

  for (const file of files) {
    const { newFile, newStorageKey } = await copyFileInternal({
      sourceFile: file,
      targetParentId: newParentDir._id,
      userId,
    });
    s3KeysCreated.push(newStorageKey);
    await newFile.save({ session });
    totalSize += newFile.size;
  }

  for (const dir of subDirs) {
    const newDir = new Directory({
      name: dir.name,
      owner: userId,
      parentDirectory: newParentDir._id,
      size: 0,
    });
    await newDir.save({ session });

    const { totalSize: nestedSize, s3KeysCreated: nestedS3Keys } = await recursiveCopy(
      dir,
      newDir,
      userId,
      session,
    );

    newDir.size = nestedSize;
    await newDir.save({ session });
    totalSize += nestedSize;
    s3KeysCreated.push(...nestedS3Keys);
  }

  return { totalSize, s3KeysCreated };
};

/**
 * @desc    Copy a directory and its contents
 * @route   POST /api/v1/directory/:id/copy
 * @access  Private
 */
export const copyDirectory = async (req, res) => {
  const { id: dirId } = req.params;
  let { targetParentId } = req.body;
  const { userId, rootDirectoryId } = req.user;

  if (targetParentId === null) {
    targetParentId = rootDirectoryId;
  }

  // Find items
  const [sourceDir, targetParentDir, user] = await Promise.all([
    Directory.findOne({ _id: dirId, owner: userId }),
    Directory.findOne({ _id: targetParentId, owner: userId }),
    User.findById(userId).select('storageUsed storageQuota rootVaultDirectory'),
  ]);

  // A simple check to ensure items exist
  if (!sourceDir) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Source directory not found.');
  }
  if (!targetParentDir) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Target directory not found.');
  }
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // Check quota
  const remainingSpace = user.storageQuota - user.storageUsed;
  if (sourceDir.size > remainingSpace) {
    throw new ApiError(
      StatusCodes.INSUFFICIENT_STORAGE,
      'Not enough storage space to copy this directory.',
    );
  }

  // Vault Checks
  await checkVaultAccess(req, sourceDir, 'directory', userId);
  const { isInVault: isTargetInVault } = await checkItemVaultStatus(
    targetParentDir._id,
    'directory',
    userId,
  );
  if (isTargetInVault && !req.user.isVaultUnlocked) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Cannot copy item to a locked vault. Please unlock your vault.',
    );
  }

  // Check for invalid operations
  if (dirId === targetParentId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot copy a directory into itself.');
  }
  if (sourceDir._id.toString() === rootDirectoryId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot copy the root directory.');
  }
  if (sourceDir._id.toString() === user.rootVaultDirectory?.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot copy the Secure Vault root.');
  }
  let currentParentId = targetParentDir._id;
  while (currentParentId) {
    if (currentParentId.toString() === dirId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot copy a directory into one of its own sub-directories.',
      );
    }
    const parent = await Directory.findById(currentParentId).lean();
    currentParentId = parent ? parent.parentDirectory : null;
  }

  let allS3KeysCreated = [];
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // Create new root dir
    const newRootDir = new Directory({
      name: sourceDir.name,
      owner: userId,
      parentDirectory: targetParentId,
      size: 0,
    });
    await newRootDir.save({ session });

    // Run recursive copy
    const { totalSize, s3KeysCreated } = await recursiveCopy(
      sourceDir,
      newRootDir,
      userId,
      session,
    );
    allS3KeysCreated = s3KeysCreated;

    // Update sizes and quota
    newRootDir.size = totalSize;
    await newRootDir.save({ session });

    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { storageUsed: totalSize } }, { session }),
      updateDirectorySize(targetParentId, totalSize, { session }),
    ]);

    // Commit transaction
    await session.commitTransaction();

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, 'Directory copied successfully', newRootDir));
  } catch (error) {
    await session.abortTransaction();
    if (allS3KeysCreated.length > 0) {
      logger.warn(
        `DB transaction failed during recursive copy. Cleaning up ${allS3KeysCreated.length} S3 objects.`,
      );
      await deleteS3Files(allS3KeysCreated.map((key) => ({ Key: key })));
    }
    logger.error(`Failed to copy directory ${dirId}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
};
