const nodemailer = require("nodemailer");
const config = require("../config");

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // true for 465, false for other ports (like 587)
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Helper to send email with error logging
 */
const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"Property Rental Platform" <${config.email.from}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Message ID: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed sending to ${to}: ${error.message}`);
    // In production or development, don't crash the server if SMTP has transient error,
    // but log the details
    throw error;
  }
};

/**
 * Sends an email verification link to newly registered users.
 * @param {string} toEmail 
 * @param {string} token 
 * @param {string} [userName] 
 */
const sendVerificationEmail = async (toEmail, token, userName = "Valued User") => {
  const verificationUrl = `${config.clientUrls.verifyEmailUrl}?token=${token}`;

  const subject = "Verify Your Email - Property Rental Platform";
  const text = `Hello ${userName},\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #1f2937; margin-bottom: 16px;">Welcome to Property Rental Platform!</h2>
      <p style="color: #4b5563; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #4b5563; line-height: 1.5;">Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">Or copy and paste this link in your browser:<br/><a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a></p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px;">This verification link will expire in 24 hours. If you did not create an account, no further action is required.</p>
    </div>
  `;

  return await sendMail({ to: toEmail, subject, html, text });
};

/**
 * Sends a password reset link to user.
 * @param {string} toEmail 
 * @param {string} token 
 * @param {string} [userName] 
 */
const sendPasswordResetEmail = async (toEmail, token, userName = "Valued User") => {
  const resetUrl = `${config.clientUrls.resetPasswordUrl}?token=${token}`;

  const subject = "Reset Your Password - Property Rental Platform";
  const text = `Hello ${userName},\n\nYou recently requested to reset your password. Click the link below to reset it:\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nIf you did not request a password reset, please ignore this email or contact support.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #1f2937; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="color: #4b5563; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #4b5563; line-height: 1.5;">We received a request to reset your password. Click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" target="_blank" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">Or copy and paste this link in your browser:<br/><a href="${resetUrl}" style="color: #dc2626;">${resetUrl}</a></p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px;">This reset link will expire in 1 hour. If you didn't request this, please secure your account immediately.</p>
    </div>
  `;

  return await sendMail({ to: toEmail, subject, html, text });
};

/**
 * Sends a notification email confirming password was changed.
 * @param {string} toEmail 
 * @param {string} [userName] 
 */
const sendPasswordChangedEmail = async (toEmail, userName = "Valued User") => {
  const subject = "Your Password Has Been Changed - Property Rental Platform";
  const text = `Hello ${userName},\n\nThis is a confirmation that your password for Property Rental Platform has been successfully changed.\n\nIf you did not perform this change, please contact our support team immediately.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #1f2937; margin-bottom: 16px;">Password Successfully Changed</h2>
      <p style="color: #4b5563; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #4b5563; line-height: 1.5;">This email confirms that the password for your Property Rental Platform account was just changed.</p>
      <p style="color: #dc2626; font-size: 14px; font-weight: 500; line-height: 1.5;">If you did not make this change, please contact support immediately to secure your account.</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px;">Property Rental Platform Security Team</p>
    </div>
  `;

  return await sendMail({ to: toEmail, subject, html, text });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
