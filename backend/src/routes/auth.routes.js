const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/auth.middleware");
const {
  authLimiter,
  sensitiveAuthLimiter,
} = require("../middleware/rateLimiter.middleware");
const {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth.validator");

const router = express.Router();

// 1. User Registration
router.post(
  "/register",
  authLimiter,
  registerValidator,
  validate,
  authController.register
);

// 2. Email Verification
router.post(
  "/verify-email",
  authLimiter,
  verifyEmailValidator,
  validate,
  authController.verifyEmail
);

// 3. Resend Verification Link
router.post(
  "/resend-verification",
  sensitiveAuthLimiter,
  resendVerificationValidator,
  validate,
  authController.resendVerification
);

// 4. User Login
router.post(
  "/login",
  sensitiveAuthLimiter,
  loginValidator,
  validate,
  authController.login
);

// 5. User Logout
router.post("/logout", authController.logout);

// 6. Refresh Access Token
router.post("/refresh-token", authController.refreshToken);

// 7. Forgot Password
router.post(
  "/forgot-password",
  sensitiveAuthLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);

// 8. Reset Password
router.post(
  "/reset-password",
  sensitiveAuthLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword
);

// 9. Current Authenticated User Identity
router.get("/me", authenticate, authController.getMe);

module.exports = router;
