import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';

// Environment Variables
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_S3_REGION = process.env.AWS_S3_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

let s3Client;

// Check variables and initialize S3 Client
if (!AWS_S3_BUCKET || !AWS_S3_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_KEY) {
  logger.warn('AWS S3 credentials are not fully configured in .env. S3 service will be disabled.');
} else {
  s3Client = new S3Client({
    region: AWS_S3_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY,
    },
  });
  logger.info('AWS S3 client initialized successfully.');
}

// Checks if the S3 client is available
const checkS3Client = () => {
  if (!s3Client) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'S3 storage service is not configured on the server.',
    );
  }
};

/**
 * Creates a pre-signed URL for uploading a file to S3.
 * @param {object} params
 * @param {string} params.key - The key (filename) for the object in S3.
 * @param {string} params.contentType - The MIME type of the file.
 * @returns {Promise<string>} - The pre-signed URL.
 */
export const createUploadSignedUrl = async ({ key, contentType }) => {
  checkS3Client();
  try {
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return url;
  } catch (error) {
    logger.error('Failed to create S3 upload URL:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create file upload URL.');
  }
};

/**
 * Creates a pre-signed URL for downloading a file from S3.
 * @param {object} params
 * @param {string} params.key - The key (filename) for the object in S3.
 * @param {string} params.filename - The desired filename for the user.
 * @param {boolean} [params.download=false] - If true, triggers download.
 * @returns {Promise<string>} - The pre-signed URL.
 */
export const createGetSignedUrl = async ({ key, filename, download = false }) => {
  checkS3Client();
  try {
    const dispositionType = download ? 'attachment' : 'inline';
    const command = new GetObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      ResponseContentDisposition: `${dispositionType}; filename=${encodeURIComponent(filename)}`,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return url;
  } catch (error) {
    logger.error('Failed to create S3 download URL:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create file URL.');
  }
};

/**
 * Gets the metadata of a file from S3
 * @param {string} key - The key of the object in S3.
 * @returns {Promise<object>} - The S3 object metadata.
 */
export const getS3FileMetaData = async (key) => {
  checkS3Client();
  try {
    const command = new HeadObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    });
    return await s3Client.send(command);
  } catch (error) {
    logger.error(`Failed to get S3 metadata for key ${key}:`, error);
    throw new ApiError(StatusCodes.NOT_FOUND, 'File metadata not found in storage.');
  }
};

/**
 * Deletes a single file from S3.
 * @param {string} key - The key of the object in S3.
 */
export const deleteS3File = async (key) => {
  checkS3Client();
  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    logger.debug(`Successfully deleted file from S3: ${key}`);
  } catch (error) {
    logger.error(`Failed to delete S3 file ${key}:`, error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete file from storage.');
  }
};

/**
 * Deletes multiple files from S3.
 * @param {Array<{Key: string}>} keys - An array of object keys to delete.
 */
export const deleteS3Files = async (keys) => {
  checkS3Client();
  if (!keys || keys.length === 0) {
    logger.debug('No keys provided to deleteS3Files, skipping.');
    return;
  }

  try {
    const command = new DeleteObjectsCommand({
      Bucket: AWS_S3_BUCKET,
      Delete: {
        Objects: keys,
        Quiet: false,
      },
    });
    await s3Client.send(command);
    logger.debug(`Successfully deleted ${keys.length} files from S3.`);
  } catch (error) {
    logger.error('Failed to delete multiple S3 files:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete files from storage.');
  }
};

/**
 * Copies an object from one key to another within the same S3 bucket.
 * @param {string} sourceKey - The key of the object to copy.
 * @param {string} destinationKey - The key for the new copied object.
 */
export const copyS3File = async (sourceKey, destinationKey) => {
  checkS3Client();
  try {
    const command = new CopyObjectCommand({
      Bucket: AWS_S3_BUCKET,
      CopySource: `${AWS_S3_BUCKET}/${sourceKey}`, // Source bucket and key
      Key: destinationKey, // Destination key
    });
    await s3Client.send(command);
    logger.debug(`Successfully copied S3 object from ${sourceKey} to ${destinationKey}`);
  } catch (error) {
    logger.error(`Failed to copy S3 file from ${sourceKey} to ${destinationKey}:`, error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to copy file in storage.');
  }
};
