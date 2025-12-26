import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  setPassword,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";
import passport from "passport";
import config from "../config";
const router = Router();

router.post(
  "/register",
  // authRateLimiter,
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  register
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  verifyOtp
);

router.post(
  "/resend-otp",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  resendOtp
);

router.post(
  "/login",
  // authRateLimiter,
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.post("/set-password", authenticate, setPassword);

router.get("/profile", authenticate, getProfile);

// Forgot Password -
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  forgotPassword
);

// Reset Password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  resetPassword
);

//google oauth

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { token, authProvider, hasSetPassword, id, email, role } =
      req.user as any;

    const userJson = encodeURIComponent(
      JSON.stringify({ id, email, role, authProvider, hasSetPassword })
    );

    res.redirect(
      `${config.FRONTEND_URL}/auth/callback?token=${token}&user=${userJson}`
    );
  }
);

// --- GitHub OAuth ---
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    const { token, authProvider, hasSetPassword, id, email, role } =
      req.user as any;

    const userJson = encodeURIComponent(
      JSON.stringify({ id, email, role, authProvider, hasSetPassword })
    );

    res.redirect(
      `${config.FRONTEND_URL}/auth/callback?token=${token}&user=${userJson}`
    );
  }
);

export default router;
