const authService = require("../services/auth.service");
const ApiResponse = require("../utils/ApiResponse");
const config = require("../config");

// Cookie helper options per RFC-001-B §8
const isProd = config.nodeEnv === "production";

const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
});

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  path: "/api/v1/auth", // Restricted path for refresh token
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });

      return new ApiResponse(
        201,
        "Registration successful. Check your email to verify your account.",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail({ token });

      const message = result.alreadyVerified
        ? "Email is already verified."
        : "Email verified successfully. You can now log in.";

      return new ApiResponse(200, message, {
        isEmailVerified: true,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification({ email });

      return new ApiResponse(200, result.message, null).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.connection.remoteAddress || null;

      const { user, accessToken, refreshToken } = await authService.login({
        email,
        password,
        userAgent,
        ip,
      });

      // Set httpOnly cookies
      res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
      res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

      return new ApiResponse(200, "Login successful", { user }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      const userAgent = req.headers["user-agent"] || null;
      const ip = req.ip || req.connection.remoteAddress || null;

      const { accessToken, refreshToken } = await authService.refreshToken({
        rawRefreshToken,
        userAgent,
        ip,
      });

      // Set updated httpOnly cookies
      res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
      res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

      return new ApiResponse(200, "Token refreshed", null).send(res);
    } catch (error) {
      // Clear cookies on refresh failure
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/api/v1/auth" });
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      await authService.logout({ rawRefreshToken });

      // Clear both cookies
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/api/v1/auth",
      });

      return new ApiResponse(200, "Logged out successfully", null).send(res);
    } catch (error) {
      // Best-effort clear on error
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/api/v1/auth" });
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword({ email });

      return new ApiResponse(200, result.message, null).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword({ token, newPassword });

      return new ApiResponse(200, result.message, null).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user._id);

      return new ApiResponse(200, "OK", result).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
