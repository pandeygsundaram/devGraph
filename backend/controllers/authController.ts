import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import prisma from "../config/database";
import { generateToken } from "../utils/jwt";
import { RegisterBody, LoginBody } from "../types";

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

    // Generate API key
    const apiKey = `key_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // Create user with API key
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        apiKey,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        apiKey: true,
      },
    });

    // Auto-create personal team for individual users
    const team = await prisma.team.create({
      data: {
        name: `${name}'s Workspace`,
        description: "Personal workspace",
        type: "PERSONAL",
        isActive: true,
      },
    });

    // Add user as team owner
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: team.id,
        role: "OWNER",
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("[Register] User object:", JSON.stringify(user, null, 2));
    console.log("[Register] Team object:", JSON.stringify(team, null, 2));
    console.log("[Register] API Key:", user.apiKey);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
      apiKey: user.apiKey,
      team: {
        id: team.id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
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

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      apiKey: user.apiKey,
      team: teamMembership?.team
        ? {
            id: teamMembership.team.id,
            name: teamMembership.team.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload?.id || userPayload?.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message:
        "Password updated successfully. You can now use this password for the CLI and Extension.",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to set password" });
  }
};
