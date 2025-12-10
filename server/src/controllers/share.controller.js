import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { File } from '../models/file.model.js';
import { Directory } from '../models/directory.model.js';
import { ShareLink } from '../models/shareLink.model.js';
import { checkItemVaultStatus } from '../services/vault.service.js';

/**
 * @desc    Create or get a share link for a file
 * @route   POST /api/v1/share/file/:id
 * @access  Private
 */
export const createFileShareLink = async (req, res) => {
  const { id: fileId } = req.params;
  const { userId } = req.user;

  const file = await File.findOne({ _id: fileId, owner: userId }).lean();
  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found.');
  }

  const { isInVault } = await checkItemVaultStatus(fileId, 'file', userId);
  if (isInVault) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot share items from the Secure Vault.');
  }

  let shareLink = await ShareLink.findOne({ file: fileId, owner: userId });
  if (shareLink) {
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Share link already exists', shareLink));
  }

  // Create new share link if not exists
  shareLink = new ShareLink({
    shareId: crypto.randomUUID(),
    owner: userId,
    file: fileId,
    directory: null,
  });

  await shareLink.save();

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, 'Share link created', shareLink));
};

/**
 * @desc    Create or get a share link for a directory
 * @route   POST /api/v1/share/directory/:id
 * @access  Private
 */
export const createDirectoryShareLink = async (req, res) => {
  const { id: dirId } = req.params;
  const { userId } = req.user;

  const directory = await Directory.findOne({
    _id: dirId,
    owner: userId,
  }).lean();
  if (!directory) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Directory not found.');
  }

  const { isInVault } = await checkItemVaultStatus(dirId, 'directory', userId);
  if (isInVault) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot share items from the Secure Vault.');
  }

  let shareLink = await ShareLink.findOne({
    directory: dirId,
    owner: userId,
  });

  if (shareLink) {
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Share link already exists', shareLink));
  }

  shareLink = new ShareLink({
    shareId: crypto.randomUUID(),
    owner: userId,
    file: null,
    directory: dirId,
  });

  await shareLink.save();

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, 'Share link created', shareLink));
};

/**
 * @desc    Delete a share link for a file
 * @route   DELETE /api/v1/share/file/:id
 * @access  Private
 */
export const deleteFileShareLink = async (req, res) => {
  const { id: fileId } = req.params;
  const { userId } = req.user;

  const result = await ShareLink.deleteOne({ file: fileId, owner: userId });

  if (result.deletedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Share link not found.');
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Share link revoked'));
};

/**
 * @desc    Delete a share link for a directory
 * @route   DELETE /api/v1/share/directory/:id
 * @access  Private
 */
export const deleteDirectoryShareLink = async (req, res) => {
  const { id: dirId } = req.params;
  const { userId } = req.user;

  const result = await ShareLink.deleteOne({
    directory: dirId,
    owner: userId,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Share link not found.');
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Share link revoked'));
};

/**
 * @desc    Get all items shared by the current user
 * @route   GET /api/v1/share/me
 * @access  Private
 */
export const getSharedByMe = async (req, res) => {
  const { userId } = req.user;

  const links = await ShareLink.find({ owner: userId })
    .populate('file', 'name mimeType size')
    .populate('directory', 'name')
    .sort({ createdAt: -1 });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Shared items retrieved', links));
};
