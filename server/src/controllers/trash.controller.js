import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Directory } from '../models/directory.model.js';
import { File } from '../models/file.model.js';
import { User } from '../models/user.model.js';
import { ShareLink } from '../models/shareLink.model.js';
import { deleteS3Files, deleteS3File } from '../services/s3.service.js';
import { updateDirectorySize } from '../services/storage.service.js';
import { getAllDescendants } from '../services/aggregation.service.js';

/**
 * @desc    Permanently delete a file from the trash
 * @route   DELETE /api/v1/trash/permanent/file/:id
 * @access  Private
 */
export const permanentDeleteFile = async (req, res) => {
  const { id: fileId } = req.params;
  const { userId, rootTrashDirectoryId } = req.user;

  const file = await File.findOne({
    _id: fileId,
    owner: userId,
  });

  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }

  // Check if the file is not in trash
  if (file.parentDirectory.toString() !== rootTrashDirectoryId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'This file is not in the trash. Cannot permanently delete.',
    );
  }

  // Perform all cleanup operations in parallel
  try {
    await Promise.all([
      deleteS3File(file.storageKey),
      User.findByIdAndUpdate(userId, {
        $inc: { storageUsed: -file.size },
      }),
      updateDirectorySize(rootTrashDirectoryId, -file.size),
      ShareLink.deleteOne({ file: file._id, owner: userId }),
      file.deleteOne(),
    ]);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'File permanently deleted successfully.'));
  } catch (error) {
    logger.error(`Failed to permanently delete file ${fileId}:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while permanently deleting the file.',
    );
  }
};

/**
 * @desc    Permanently delete a directory from the trash
 * @route   DELETE /api/v1/trash/permanent/directory/:id
 * @access  Private
 */
export const permanentDeleteDirectory = async (req, res) => {
  const { id: dirId } = req.params;
  const { userId, rootTrashDirectoryId } = req.user;

  const directoryToDelete = await Directory.findOne({
    _id: dirId,
    owner: userId,
  });

  if (!directoryToDelete) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Directory not found.');
  }

  // Check if the directory is not in the trash
  if (directoryToDelete.parentDirectory.toString() !== rootTrashDirectoryId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'This directory is not in the trash. Cannot permanently delete.',
    );
  }

  // Get all nested contents
  logger.debug(`Starting permanent deletion for directory ${dirId}...`);
  const { files, dirs } = await getAllDescendants(dirId, userId);
  const totalDirSize = directoryToDelete.size;

  // Prepare lists for deletion
  const s3Keys = files.map((f) => ({ Key: f.storageKey }));
  const fileIds = files.map((f) => f._id);
  const dirIds = dirs.map((d) => d._id);
  dirIds.push(dirId);

  // Perform all deletions in parallel
  logger.debug(`Permanently deleting ${fileIds.length} files and ${dirIds.length} directories.`);
  try {
    await Promise.all([
      deleteS3Files(s3Keys),
      File.deleteMany({ _id: { $in: fileIds } }),
      Directory.deleteMany({ _id: { $in: dirIds } }),
      ShareLink.deleteMany({
        owner: userId,
        $or: [{ file: { $in: fileIds } }, { directory: { $in: dirIds } }],
      }),
      User.findByIdAndUpdate(userId, {
        $inc: { storageUsed: -totalDirSize },
      }),
      updateDirectorySize(rootTrashDirectoryId, -totalDirSize),
    ]);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Directory and all its contents permanently deleted'));
  } catch (error) {
    logger.error(`Failed to permanently delete directory ${dirId}:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while permanently deleting the directory.',
    );
  }
};

/**
 * @desc    Empty the entire trash
 * @route   DELETE /api/v1/trash/empty
 * @access  Private
 */
export const emptyTrash = async (req, res) => {
  const { userId, rootTrashDirectoryId } = req.user;

  // Get all contents of the trash
  const { files, dirs } = await getAllDescendants(rootTrashDirectoryId, userId);

  // Find the trash directory itself to get the total size
  const trashDirectory = await Directory.findById(rootTrashDirectoryId);
  const totalTrashSize = trashDirectory ? trashDirectory.size : 0;

  if (totalTrashSize === 0 && files.length === 0 && dirs.length === 0) {
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Trash is already empty.'));
  }

  // Prepare lists for deletion
  const s3Keys = files.map((f) => ({ Key: f.storageKey }));
  const fileIds = files.map((f) => f._id);
  const dirIds = dirs.map((d) => d._id);

  // Perform all deletions in parallel
  logger.debug(`Emptying trash: ${fileIds.length} files and ${dirIds.length} directories.`);
  try {
    await Promise.all([
      deleteS3Files(s3Keys),
      File.deleteMany({ _id: { $in: fileIds } }),
      Directory.deleteMany({ _id: { $in: dirIds } }),
      ShareLink.deleteMany({
        owner: userId,
        $or: [{ file: { $in: fileIds } }, { directory: { $in: dirIds } }],
      }),
      User.findByIdAndUpdate(userId, {
        $inc: { storageUsed: -totalTrashSize },
      }),
      Directory.findByIdAndUpdate(rootTrashDirectoryId, { $set: { size: 0 } }),
    ]);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Trash emptied successfully'));
  } catch (error) {
    logger.error(`Failed to empty trash for user ${userId}:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while emptying the trash.',
    );
  }
};
