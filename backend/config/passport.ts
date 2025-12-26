// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "./database";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "./index";
import { sendNotificationEmail } from "../utils/grpc";

// Helper to generate consistent tokens
const generateUserToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};

// --- Google Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID!,
      clientSecret: config.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(null, false);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // 1. Create New User
          const randomPassword = crypto.randomBytes(32).toString("hex");
          const bcrypt = require("bcryptjs");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          // Generate API key
          const apiKey = `key_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}`;

          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              password: hashedPassword,
              authProvider: "GOOGLE",
              isVerified: true, // ✅ OAuth is trusted, so verified = true
              hasSetPassword: false, // ✅ They haven't set a local password yet
              apiKey,
            },
          });

          // 2. Create Personal Workspace (CRITICAL for Dashboard)
          const team = await prisma.team.create({
            data: {
              name: `${user.name}'s Workspace`,
              description: "Personal workspace",
              type: "PERSONAL",
              isActive: true,
            },
          });

          // 3. Add user as team owner
          await prisma.teamMember.create({
            data: {
              userId: user.id,
              teamId: team.id,
              role: "OWNER",
            },
          });

          // 4. Send Welcome Email (Only for new users)
          try {
            await sendNotificationEmail(user.id, email, "WELCOME", {
              name: profile.displayName,
              username: email.split("@")[0],
              registrationDate: new Date().toLocaleDateString(),
              loginLink: `${config.FRONTEND_URL}/login`,
            });
          } catch (error) {
            console.error("Failed to queue Welcome email:", error);
          }
        } else {
          // 5. Existing User: Check verification status
          if (!user.isVerified) {
            // If they signed up via email before but didn't verify,
            // Google login verifies them automatically.
            user = await prisma.user.update({
              where: { id: user.id },
              data: { isVerified: true },
            });
          }
        }

        const token = generateUserToken(user);

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          token,
          authProvider: user.authProvider,
          hasSetPassword: user.hasSetPassword,
        } as any);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// --- GitHub Strategy ---
passport.use(
  new GitHubStrategy(
    {
      clientID: config.GITHUB_CLIENT_ID!,
      clientSecret: config.GITHUB_CLIENT_SECRET!,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
      try {
        let email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found from GitHub"), null);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // 1. Create New User
          const randomPassword = crypto.randomBytes(32).toString("hex");
          const bcrypt = require("bcryptjs");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const apiKey = `key_${Date.now()}_${Math.random()
            .toString(36)
            .substring(7)}`;

          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username,
              password: hashedPassword,
              authProvider: "GITHUB",
              isVerified: true, // ✅ Verified
              hasSetPassword: false, // ✅ No local password
              apiKey,
            },
          });

          // 2. Create Personal Workspace
          const team = await prisma.team.create({
            data: {
              name: `${user.name}'s Workspace`,
              description: "Personal workspace",
              type: "PERSONAL",
              isActive: true,
            },
          });

          // 3. Add user as team owner
          await prisma.teamMember.create({
            data: {
              userId: user.id,
              teamId: team.id,
              role: "OWNER",
            },
          });

          // 4. Send Welcome Email
          try {
            await sendNotificationEmail(user.id, email, "WELCOME", {
              name: profile.displayName || profile.username,
              username: email.split("@")[0],
              registrationDate: new Date().toLocaleDateString(),
              loginLink: `${config.FRONTEND_URL}/login`,
            });
          } catch (error) {
            console.error("Failed to queue Welcome email:", error);
          }
        } else {
          // 5. Existing User: Check verification status
          if (!user.isVerified) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { isVerified: true },
            });
          }
        }

        const token = generateUserToken(user);

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          token,
          authProvider: user.authProvider,
          hasSetPassword: user.hasSetPassword,
        } as any);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
