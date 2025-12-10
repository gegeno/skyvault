import path from 'path';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Directory } from '../models/directory.model.js';
import { File } from '../models/file.model.js';
import { User } from '../models/user.model.js';
import { ShareLink } from '../models/shareLink.model.js';
import { updateDirectorySize } from '../services/storage.service.js';
import { checkItemVaultStatus, checkVaultAccess } from '../services/vault.service.js';
import {
  createUploadSignedUrl,
  getS3FileMetaData,
  deleteS3File,
  createGetSignedUrl,
  copyS3File,
} from '../services/s3.service.js';

/**
 * @desc    Initiate a file upload
 * @route   POST /api/v1/file/upload/initiate
 * @access  Private
 */
export const initiateUpload = async (req, res) => {
  const { name, size, mimeType, parentId } = req.body;
  const { userId, rootDirectoryId, isVaultUnlocked } = req.user;

  // Check user's storage quota
  const user = await User.findById(userId).select(
    'storageUsed storageQuota rootVaultDirectory hasVault',
  );
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const remainingSpace = user.storageQuota - user.storageUsed;
  if (size > remainingSpace) {
    throw new ApiError(
      StatusCodes.INSUFFICIENT_STORAGE,
      'Not enough storage space to upload this file.',
    );
  }

  // Determine the parent directory
  const parentDirId = parentId || rootDirectoryId;

  // Verify the parent directory exists and is owned by the user
  const parentDir = await Directory.findOne({
    _id: parentDirId,
    owner: userId,
  }).lean();

  if (!parentDir) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'The parent directory does not exist or you do not have access.',
    );
  }

  // Vault Check
  if (user.hasVault) {
    const { isInVault } = await checkItemVaultStatus(parentDir._id, 'directory', userId);
    if (isInVault && !isVaultUnlocked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Cannot upload to a locked vault. Please unlock your vault to proceed.',
      );
    }
  }

  // Create a new File document in the database
  const newFile = new File({
    name,
    size,
    mimeType,
    owner: userId,
    parentDirectory: parentDir._id,
    storageKey: `placeholder`,
    status: 'pending',
  });

  const extension = path.extname(name);

  // Generate the unique storageKey
  newFile.storageKey = `${newFile._id}${extension}`;
  await newFile.save();

  // Get the pre-signed URL from S3 service
  const uploadUrl = await createUploadSignedUrl({
    key: newFile.storageKey,
    contentType: newFile.mimeType,
  });

  // Send the URL and fileId back to the client
  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(
      StatusCodes.CREATED,
      'Upload initiated. Please use the URL to upload the file.',
      {
        uploadUrl,
        fileId: newFile._id,
      },
    ),
  );
};

/**
 * @desc    Complete a file upload
 * @route   POST /api/v1/file/upload/complete
 * @access  Private
 */
export const completeUpload = async (req, res) => {
  const { fileId } = req.body;
  const { userId } = req.user;

  // Find the file record in our database
  const file = await File.findOne({
    _id: fileId,
    owner: userId,
  });

  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File record not found.');
  }

  try {
    // Get the file's metadata from S3
    const s3MetaData = await getS3FileMetaData(file.storageKey);

    // Verify the size in S3 matches the size we expected
    if (s3MetaData.ContentLength !== file.size) {
      // If not, this is a bad upload. Clean up.
      logger.warn(
        `File size mismatched for ${fileId}. S3: ${s3MetaData.ContentLength}, DB: ${file.size}`,
      );
      // Run cleanup in parallel
      await Promise.all([
        deleteS3File(file.storageKey), // Delete bad file from S3
        file.deleteOne(), // Delete bad record from DB
      ]);
      throw new ApiError(StatusCodes.BAD_REQUEST, 'File upload failed: size mismatch.');
    }

    file.status = 'available';
    await file.save();

    // Update the user's total storage used and the directory sizes.
    await Promise.all([
      // Update the user's total storage
      User.findByIdAndUpdate(userId, {
        $inc: { storageUsed: file.size },
      }),
      // Update all parent directory sizes
      updateDirectorySize(file.parentDirectory, file.size),
    ]);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'File uploaded successfully.', file));
  } catch (error) {
    logger.error(`Upload completion failed for ${fileId}:`, error);
    await file.deleteOne();
    throw new ApiError(
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || 'File upload verification failed.',
    );
  }
};

/**
 * @desc    Get a file (download/view)
 * @route   GET /api/v1/file/:id
 * @access  Private
 */
export const getFile = async (req, res) => {
  const { id } = req.params;
  const { download } = req.query;
  const { userId } = req.user;

  // Find the file
  const file = await File.findOne({
    _id: id,
    owner: userId,
  }).lean();

  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }

  // Vault Check
  await checkVaultAccess(req, file, 'file', userId);

  // Generate the signed S3 URL
  const fileUrl = await createGetSignedUrl({
    key: file.storageKey,
    filename: file.name,
    download: download === 'true',
  });

  // Redirect the client to the signed URL
  return res.redirect(fileUrl);
};

/**
 * @desc    Rename a file
 * @route   PATCH /api/v1/file/:id
 * @access  Private
 */
export const renameFile = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { userId } = req.user;

  // Find the file
  const file = await File.findOne({
    _id: id,
    owner: userId,
  });

  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }

  // Vault Check
  await checkVaultAccess(req, file, 'file', userId);

  // Update the file in the database
  file.name = name;
  await file.save();

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'File renamed successfully', file));
};

/**
 * @desc    Move a file to the trash
 * @route   DELETE /api/v1/file/:id
 * @access  Private
 */
export const deleteFile = async (req, res) => {
  const { id: fileId } = req.params;
  const { userId, rootTrashDirectoryId } = req.user;

  // Find the file
  const fileToMove = await File.findOne({ _id: fileId, owner: userId });

  if (!fileToMove) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }

  if (fileToMove.status === 'pending') {
    // Delete pending files permanently
    await Promise.all([deleteS3File(fileToMove.storageKey), fileToMove.deleteOne()]);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Pending file upload cancelled and cleaned up.'));
  }

  // Vault Check
  await checkVaultAccess(req, fileToMove, 'file', userId);

  // Check if it's already in the trash
  const oldParentId = fileToMove.parentDirectory;
  if (oldParentId.toString() === rootTrashDirectoryId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is already in the trash.');
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update sizes
    await Promise.all([
      updateDirectorySize(oldParentId, -fileToMove.size, { session }),
      updateDirectorySize(rootTrashDirectoryId, fileToMove.size, { session }),
    ]);

    // Update the file's parent to the trash
    fileToMove.parentDirectory = rootTrashDirectoryId;
    await fileToMove.save({ session });

    // Revoke share links
    await ShareLink.deleteOne({ file: fileId, owner: userId }, { session });

    // Commit the transaction
    await session.commitTransaction();

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'File moved to trash successfully', fileToMove));
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to move file ${fileId} to trash:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while moving the file to trash.',
    );
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Move a file to a new directory
 * @route   PATCH /api/v1/file/:id/move
 * @access  Private
 */
export const moveFile = async (req, res) => {
  const { id: fileId } = req.params;
  let { newParentId } = req.body;
  const { userId, rootDirectoryId } = req.user;

  if (newParentId === null) {
    newParentId = rootDirectoryId;
  }

  // Find items
  const [fileToMove, newParentDir] = await Promise.all([
    File.findOne({ _id: fileId, owner: userId }),
    Directory.findOne({ _id: newParentId, owner: userId }),
  ]);

  if (!fileToMove) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }
  if (!newParentDir) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Target directory not found.');
  }

  const oldParentId = fileToMove.parentDirectory;

  // Check if it's already in the target directory
  if (oldParentId.toString() === newParentId.toString()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is already in this directory.');
  }

  // Vault Checks
  await checkVaultAccess(req, fileToMove, 'file', userId);
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

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update sizes
    await Promise.all([
      updateDirectorySize(oldParentId, -fileToMove.size, { session }),
      updateDirectorySize(newParentId, fileToMove.size, { session }),
    ]);

    // Update the file's parent
    fileToMove.parentDirectory = newParentId;
    await fileToMove.save({ session });

    // If moving to vault, revoke share link
    if (isTargetInVault) {
      await ShareLink.deleteOne({ file: fileId, owner: userId }, { session });
    }

    // Commit
    await session.commitTransaction();

    // Send response
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'File moved successfully', fileToMove));
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to move file ${fileId}:`, error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while moving the file.',
    );
  } finally {
    session.endSession();
  }
};

// Internal helper function to copy a file.
export const copyFileInternal = async ({ sourceFile, targetParentId, userId }) => {
  // Create new File document
  const newFile = new File({
    name: sourceFile.name,
    owner: userId,
    parentDirectory: targetParentId,
    size: sourceFile.size,
    mimeType: sourceFile.mimeType,
    storageKey: 'placeholder',
  });

  // Generate new unique storage key
  const extension = path.extname(sourceFile.name);
  const newStorageKey = `${newFile._id.toString()}${extension}`;
  newFile.storageKey = newStorageKey;

  // Perform the S3 copy
  await copyS3File(sourceFile.storageKey, newStorageKey);

  // Return the new document and key
  return { newFile, newStorageKey };
};

/**
 * @desc    Copy a file
 * @route   POST /api/v1/file/:id/copy
 * @access  Private
 */
export const copyFile = async (req, res) => {
  const { id: fileId } = req.params;
  let { targetParentId } = req.body;
  const { userId, rootDirectoryId } = req.user;

  if (targetParentId === null) {
    targetParentId = rootDirectoryId;
  }

  // Find items
  const [sourceFile, targetParentDir, user] = await Promise.all([
    File.findOne({ _id: fileId, owner: userId }),
    Directory.findOne({ _id: targetParentId, owner: userId }),
    User.findById(userId).select('storageUsed storageQuota'),
  ]);

  if (!sourceFile) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }
  if (!targetParentDir) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Target directory not found.');
  }
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // Check quota
  const remainingSpace = user.storageQuota - user.storageUsed;
  if (sourceFile.size > remainingSpace) {
    throw new ApiError(
      StatusCodes.INSUFFICIENT_STORAGE,
      'Not enough storage space to copy this file.',
    );
  }

  // Vault Checks
  await checkVaultAccess(req, sourceFile, 'file', userId);
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

  let newStorageKey = '';
  let s3CopySuccess = false;
  const session = await mongoose.startSession();

  try {
    // Perform S3 Copy
    const { newFile, newStorageKey: generatedKey } = await copyFileInternal({
      sourceFile,
      targetParentId,
      userId,
    });
    newStorageKey = generatedKey;
    s3CopySuccess = true;

    // Start Transaction
    session.startTransaction();

    // Save new file and update sizes
    await Promise.all([
      newFile.save({ session }),
      User.findByIdAndUpdate(userId, { $inc: { storageUsed: newFile.size } }, { session }),
      updateDirectorySize(targetParentId, newFile.size, { session }),
    ]);

    // Commit transaction
    await session.commitTransaction();

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, 'File copied successfully', newFile));
  } catch (error) {
    await session.abortTransaction();
    if (s3CopySuccess) {
      logger.warn(`DB transaction failed after S3 copy. Cleaning up S3 object: ${newStorageKey}`);
      await deleteS3File(newStorageKey);
    }
    logger.error(`Failed to copy file ${fileId}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
};
