const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const RefreshToken = require("../models/RefreshToken");
const { hashPassword, comparePassword } = require("../utils/password");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { generateRandomToken, hashToken } = require("../utils/token");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require("../utils/email");
const ApiError = require("../utils/ApiError");

class AuthService {
  /**
   * Registers a new tenant user and sends an email verification link.
   */
  async register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "TENANT",
      isEmailVerified: false,
      isActive: true,
      isBlocked: false,
    });

    // Generate random 32-byte verification token
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);

    // Store token hash in AuthToken (24 hour expiry)
    await AuthToken.create({
      userId: user._id,
      type: "email_verification",
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, rawToken, user.name);
    } catch (emailErr) {
      console.error("[REGISTER] Email sending failed:", emailErr.message);
      // We don't fail registration if email provider fails temporarily,
      // user can use resend-verification endpoint
    }

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Verifies a user's email using the provided token.
   */
  async verifyEmail({ token }) {
    if (!token) {
      throw new ApiError(400, "Verification token is required.");
    }

    const tokenHash = hashToken(token);

    const authToken = await AuthToken.findOne({
      tokenHash,
      type: "email_verification",
    });

    if (!authToken) {
      throw new ApiError(401, "Invalid or expired verification token.");
    }

    // Check if already used
    if (authToken.used) {
      // Idempotent: verify user is indeed marked verified
      const user = await User.findById(authToken.userId);
      if (user && user.isEmailVerified) {
        return { isEmailVerified: true, alreadyVerified: true };
      }
      throw new ApiError(401, "Verification link has already been used.");
    }

    // Check expiry
    if (authToken.expiresAt < new Date()) {
      throw new ApiError(
        401,
        "Verification link expired. Please request a new one."
      );
    }

    // Mark user as verified
    await User.findByIdAndUpdate(authToken.userId, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    // Mark token as used
    authToken.used = true;
    await authToken.save();

    return { isEmailVerified: true };
  }

  /**
   * Resends an email verification link.
   * Returns a generic success response to prevent email enumeration.
   */
  async resendVerification({ email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Only process if user exists, active, not blocked, and not yet verified
    if (user && user.isActive && !user.isBlocked && !user.isEmailVerified) {
      // Mark any prior verification tokens as used
      await AuthToken.updateMany(
        { userId: user._id, type: "email_verification", used: false },
        { used: true }
      );

      // Generate new token
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);

      await AuthToken.create({
        userId: user._id,
        type: "email_verification",
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        used: false,
      });

      try {
        await sendVerificationEmail(user.email, rawToken, user.name);
      } catch (err) {
        console.error("[RESEND_VERIFY] Email sending failed:", err.message);
      }
    }

    // Anti-enumeration generic response
    return {
      message:
        "If this email is registered and unverified, a verification link has been sent.",
    };
  }

  /**
   * Authenticates user with email and password. Issues access & refresh token pair.
   */
  async login({ email, password, userAgent = null, ip = null }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Query user including password field
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Check if account is temporarily locked due to failed attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / (60 * 1000)
      );
      throw new ApiError(
        429,
        `Account temporarily locked due to failed attempts. Please try again in ${remainingMinutes} minute(s).`
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account for 15 minutes after 5 consecutive failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await user.save();
      throw new ApiError(401, "Invalid email or password.");
    }

    // Reset failed login attempts on successful credentials verification
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    // Check account status
    if (user.isBlocked) {
      throw new ApiError(
        403,
        "Account is disabled/blocked. Please contact support."
      );
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated.");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(403, "Email not verified. Please check your inbox.");
    }

    // Issue tokens
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
    });

    // Store hashed refresh token in database (7 days expiry)
    const tokenHash = hashToken(refreshToken);
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      userAgent,
      ip,
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes access token with Refresh Token Rotation and Replay Attack Detection.
   */
  async refreshToken({ rawRefreshToken, userAgent = null, ip = null }) {
    if (!rawRefreshToken) {
      throw new ApiError(401, "Refresh token required.");
    }

    // Verify JWT signature and token type
    const decoded = verifyRefreshToken(rawRefreshToken);

    const tokenHash = hashToken(rawRefreshToken);
    const existingSession = await RefreshToken.findOne({ tokenHash });

    if (!existingSession) {
      // Replay or invalid token: Invalidate all sessions for security
      await RefreshToken.updateMany(
        { userId: decoded.sub },
        { revoked: true }
      );
      throw new ApiError(401, "Session expired or invalid. Please log in again.");
    }

    // Replay attack detection: If the token is already revoked, an attacker is reusing it
    if (existingSession.revoked) {
      await RefreshToken.updateMany(
        { userId: decoded.sub },
        { revoked: true }
      );
      throw new ApiError(
        401,
        "Session has been revoked. Replay detected. Please log in again."
      );
    }

    // Check expiration
    if (existingSession.expiresAt < new Date()) {
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    // Verify user is still valid and active
    const user = await User.findById(decoded.sub);
    if (!user || user.isBlocked || !user.isActive) {
      throw new ApiError(403, "Account is disabled/blocked.");
    }

    // Rotate tokens: Create NEW pair
    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
    });

    // Store NEW refresh token record
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      userAgent,
      ip,
    });

    // Revoke the OLD refresh token record (do NOT overwrite)
    existingSession.revoked = true;
    await existingSession.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logs out user by revoking the refresh token session.
   */
  async logout({ rawRefreshToken }) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.findOneAndUpdate(
        { tokenHash },
        { revoked: true }
      );
    }
    return true;
  }

  /**
   * Requests a password reset link.
   * Returns a generic success response to prevent email enumeration.
   */
  async forgotPassword({ email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.isActive && !user.isBlocked) {
      // Invalidate any active password_reset tokens
      await AuthToken.updateMany(
        { userId: user._id, type: "password_reset", used: false },
        { used: true }
      );

      // Generate random reset token
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);

      // Store in AuthToken (1 hour expiry)
      await AuthToken.create({
        userId: user._id,
        type: "password_reset",
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        used: false,
      });

      try {
        await sendPasswordResetEmail(user.email, rawToken, user.name);
      } catch (err) {
        console.error("[FORGOT_PASSWORD] Email sending failed:", err.message);
      }
    }

    // Generic response to prevent account enumeration
    return {
      message: "If this email exists, a password reset link has been sent.",
    };
  }

  /**
   * Resets user password, invalidates all sessions, and sends notification email.
   */
  async resetPassword({ token, newPassword }) {
    if (!token) {
      throw new ApiError(400, "Reset token is required.");
    }

    const tokenHash = hashToken(token);

    const authToken = await AuthToken.findOne({
      tokenHash,
      type: "password_reset",
      used: false,
    });

    if (!authToken || authToken.expiresAt < new Date()) {
      throw new ApiError(
        401,
        "Invalid or expired reset token. Please request a new one."
      );
    }

    const user = await User.findById(authToken.userId);
    if (!user) {
      throw new ApiError(401, "User account no longer exists.");
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Mark reset token as used
    authToken.used = true;
    await authToken.save();

    // Revoke ALL active refresh sessions on all devices for this user
    await RefreshToken.updateMany(
      { userId: user._id, revoked: false },
      { revoked: true }
    );

    // Send security notification email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (err) {
      console.error("[RESET_PASSWORD] Notification email failed:", err.message);
    }

    return {
      message:
        "Password reset successful. Please log in with your new password.",
    };
  }

  /**
   * Returns current authenticated user's profile info.
   */
  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}

module.exports = new AuthService();
