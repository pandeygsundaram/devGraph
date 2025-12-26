// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import crypto from "crypto";
import prisma from "../config/database";
import { generateToken } from "../utils/jwt";
import { RegisterBody, LoginBody } from "../types";
import { sendNotificationEmail } from "../utils/grpc";

// --- Helpers ---

// Generate 6 digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Standardized Token Generation (DRY)
const generateUserToken = (user: any) => {
  return generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

// --- Controllers ---

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes expiry

    // Generate unique API key
    const apiKey = `key_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // 1. Create User (Unverified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        apiKey,
        authProvider: "EMAIL",
        isVerified: false,
        hasSetPassword: true,
        otp,
        otpExpiry,
      },
    });

    // 2. Send OTP Email via gRPC
    try {
      await sendNotificationEmail(user.id, user.email, "OTP", {
        name: user.name,
        otp: otp,
        expiryMinutes: 10,
      });
    } catch (grpcError) {
      console.error("Failed to queue OTP email:", grpcError);
    }

    // 3. Return Success (But NO Token)
    res.status(201).json({
      message: "Registration successful. Please check your email for the OTP.",
      userId: user.id, // Client needs this for the verification step
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "User is already verified" });
      return;
    }

    // Check OTP validity
    if (!user.otp || user.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      res.status(400).json({ error: "OTP has expired" });
      return;
    }

    // --- OTP Valid: Proceed to Activate Account ---

    // 1. Create Personal Workspace (Team)
    const team = await prisma.team.create({
      data: {
        name: `${user.name}'s Workspace`,
        description: "Personal workspace",
        type: "PERSONAL",
        isActive: true,
      },
    });

    // 2. Add user as team owner
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "OWNER",
      },
    });

    // 3. Update User Status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null, // Clear OTP
        otpExpiry: null,
      },
    });

    // 4. Generate Token
    const token = generateUserToken(updatedUser);

    // 5. Send Welcome Email via gRPC (Optional)
    try {
      await sendNotificationEmail(
        updatedUser.id,
        updatedUser.email,
        "WELCOME",
        {
          name: updatedUser.name,
          username: updatedUser.email.split("@")[0],
          registrationDate: new Date().toLocaleDateString(),
          loginLink: `${process.env.FRONTEND_URL}/login`,
        }
      );
    } catch (error) {
      console.error("Failed to queue Welcome email:", error);
    }

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
      token,
      apiKey: updatedUser.apiKey,
      team: {
        id: team.id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "User is already verified" });
      return;
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiry },
    });

    // Send via gRPC
    try {
      await sendNotificationEmail(user.id, user.email, "OTP", {
        name: user.name,
        otp: otp,
        expiryMinutes: 10,
      });
    } catch (error) {
      console.error("Failed to resend OTP email:", error);
      res.status(500).json({ error: "Failed to send email" });
      return;
    }

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // CHECK: Is the user verified?
    if (user.authProvider === "EMAIL" && !user.isVerified) {
      res.status(403).json({
        error: "Account not verified. Please verify your email.",
        isVerified: false,
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Get user's primary team
    const teamMembership = await prisma.teamMember.findFirst({
      where: { userId: user.id },
      include: {
        team: true,
      },
      orderBy: { joinedAt: "asc" },
    });

    const token = generateUserToken(user);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        hasSetPassword: user.hasSetPassword,
      },
      token,
      apiKey: user.apiKey,
      team: teamMembership?.team
        ? { id: teamMembership.team.id, name: teamMembership.team.name }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userPayload = (req as any).user;

    // Robust check for ID
    const userId = userPayload?.id || userPayload?.userId;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        hasSetPassword: true,
      },
    });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Set Password Error:", error);
    res.status(500).json({ error: "Failed to set password" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res
        .status(200)
        .json({ message: "If that email exists, we have sent a reset link." });
      return;
    }

    // 1. Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Send via gRPC
    try {
      await sendNotificationEmail(user.id, user.email, "RESET_PASSWORD", {
        name: user.name,
        link: resetLink,
      });
    } catch (err) {
      // Rollback on failure
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      throw new Error("Email sending failed");
    }

    res
      .status(200)
      .json({ message: "If that email exists, we have sent a reset link." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res
        .status(400)
        .json({ error: "Invalid or expired password reset token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        hasSetPassword: true,
      },
    });

    res
      .status(200)
      .json({ message: "Password has been reset successfully. Please login." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    // Robust check to handle both 'id' and 'userId' from token
    const userId = userPayload?.id || userPayload?.userId;

    if (!userId) {
      res.status(401).json({ error: "User ID missing from token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Fetch Team Membership (Needed for Dashboard)
    const teamMembership = await prisma.teamMember.findFirst({
      where: { userId: user.id },
      include: { team: true },
      orderBy: { joinedAt: "asc" },
    });

    // Return exact same structure as login/verify
    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      apiKey: user.apiKey,
      team: teamMembership?.team
        ? { id: teamMembership.team.id, name: teamMembership.team.name }
        : null,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
