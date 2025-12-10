import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { File } from '../models/file.model.js';
import { Directory } from '../models/directory.model.js';
import { ShareLink } from '../models/shareLink.model.js';
import { createGetSignedUrl } from '../services/s3.service.js';

/**
 * @desc    Get details of a shared file or directory
 * @route   GET /api/v1/public/share/:shareId
 * @access  Public
 */
export const getPublicShareDetails = async (req, res) => {
  const { shareId } = req.params;

  // Find the share link
  const shareLink = await ShareLink.findOne({ shareId })
    .populate('file')
    .populate('directory')
    .populate('owner', 'name') // Only populate owner's name
    .lean();

  if (!shareLink) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shared link not found.');
  }

  // If it's a file, return file details
  if (shareLink.file) {
    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, 'Shared file details retrieved', {
        type: 'file',
        ownerName: shareLink.owner.name,
        details: shareLink.file,
      }),
    );
  }

  // If it's a directory, return directory details + contents
  if (shareLink.directory) {
    const dirId = shareLink.directory._id;

    const [subDirectories, files] = await Promise.all([
      Directory.find({
        parentDirectory: dirId,
      }).lean(),
      File.find({
        parentDirectory: dirId,
      }).lean(),
    ]);

    const data = {
      type: 'directory',
      ownerName: shareLink.owner.name,
      details: {
        ...shareLink.directory,
        directories: subDirectories,
        files: files,
      },
    };

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, 'Shared directory details retrieved', data));
  }

  throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid share link.');
};

/**
 * @desc    Download a shared file
 * @route   GET /api/v1/public/download/:shareId
 * @access  Public
 */
export const downloadPublicFile = async (req, res) => {
  const { shareId } = req.params;

  // Find the link and populate the file
  const shareLink = await ShareLink.findOne({ shareId }).populate('file').lean();

  if (!shareLink) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Shared link not found.');
  }
  if (!shareLink.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File not found.');
  }

  const file = shareLink.file;

  // Generate the signed S3 URL
  const fileUrl = await createGetSignedUrl({
    key: file.storageKey,
    filename: file.name,
    download: true,
  });

  // Redirect the client to the signed URL
  return res.redirect(fileUrl);
};
