import nodemailer from 'nodemailer';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { getOTPEmailTemplate } from '../utils/otpTemplate.js';
import { getWelcomeEmailTemplate } from '../utils/welcomeEmailTemplate.js';
import { getPasswordResetEmailTemplate } from '../utils/passwordResetEmail.js';

// Environment Variables
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter;

// Transporter Configuration
if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  logger.warn(
    'Email service is not configured. GMAIL_USER or GMAIL_APP_PASSWORD missing from .env.',
  );
  logger.warn('Email sending will be disabled.');
} else {
  // Create a reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  // Verify connection configuration on startup
  transporter.verify((error, success) => {
    if (error) {
      logger.error('Nodemailer verification error:', error);
    } else {
      logger.info('Nodemailer is configured and ready to send emails.', success);
    }
  });
}

/**
 * Sends an OTP email using Nodemailer.
 * @param {string} to - The recipient's email address.
 * @param {string} otp - The 4-digit OTP code.
 */
export const sendOtpEmail = async (to, otp) => {
  // Check if the transporter was successfully configured
  if (!transporter) {
    logger.error('Email service is not configured. Cannot send OTP.');
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Email service is not configured.');
  }

  // Define the email options
  const mailOptions = {
    from: `"SkyVault" <${GMAIL_USER}>`,
    to: to,
    subject: 'Your One-Time Password (OTP) for SkyVault account login',
    html: getOTPEmailTemplate(otp),
  };

  try {
    logger.debug(`Sending OTP email to: ${to}`);
    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent successfully to: ${to}`);
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send OTP email.');
  }
};

export const sendWelcomeEmail = async (to, name) => {
  // Check if the transporter was successfully configured
  if (!transporter) {
    logger.error('Email service is not configured. Cannot send OTP.');
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Email service is not configured.');
  }

  // Define the email options
  const mailOptions = {
    from: `"SkyVault" <${GMAIL_USER}>`,
    to: to,
    subject: 'Welcome to SkyVault!',
    html: getWelcomeEmailTemplate(name),
  };

  try {
    logger.debug(`Sending welcome email to: ${to}`);
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent successfully to: ${to}`);
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send welcome email.');
  }
};

/**
 * Sends a password reset email using Nodemailer.
 * @param {string} to - The recipient's email address.
 * @param {string} name - The user's first name.
 * @param {string} resetLink - The unique password reset link.
 */
export const sendPasswordResetEmail = async (to, name, resetLink) => {
  // Check if the transporter was successfully configured
  if (!transporter) {
    logger.error('Email service is not configured. Cannot send password reset.');
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Email service is not configured.');
  }

  // Define the email options
  const mailOptions = {
    from: `"SkyVault" <${GMAIL_USER}>`,
    to: to,
    subject: 'Your Password Reset Request for SkyVault',
    html: getPasswordResetEmailTemplate(name, resetLink, 15), // 15 minute expiry
  };

  try {
    logger.debug(`Sending password reset email to: ${to}`);
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent successfully to: ${to}`);
  } catch (error) {
    logger.error(`Error sending password reset email to ${to}:`, error);
    // Re-throw a custom error so the controller can handle it
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send password reset email.');
  }
};
