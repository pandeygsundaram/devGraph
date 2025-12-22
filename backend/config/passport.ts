// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "./database";
import jwt from "jsonwebtoken";
import config from "./index";

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
          // For Google OAuth users, set a random password since they won't use it
          const randomPassword = Math.random().toString(36).slice(-10);
          const bcrypt = require("bcryptjs");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              password: hashedPassword,
            },
          });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          token,
        } as any);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

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
          // Create new user
          const randomPassword = Math.random().toString(36).slice(-10);
          const bcrypt = require("bcryptjs");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username,
              password: hashedPassword,
            },
          });
        }

        // Generate Token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" }
        );

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          token,
        } as any);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
