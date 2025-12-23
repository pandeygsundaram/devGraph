import { TemplateMap } from "./types";

export const generalTemplates: {
  [K in "OTP" | "WELCOME" | "RESET_PASSWORD"]: (
    data: TemplateMap[K & keyof TemplateMap]
  ) => {
    subject: string;
    body: string;
  };
} = {
  OTP: ({ name, otp }) => ({
    subject: "Your OTP for Verification",
    body: `Dear ${name},\n\nYour One-Time Password (OTP) for verifying your account is: ${otp}.\n\nPlease enter this code to complete the verification process. This code is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nRenard Team`,
  }),

  WELCOME: ({ name }) => ({
    subject: "Welcome to Renard!",
    body: `Hi ${name},\n\nWelcome aboard! We're thrilled to have you with us.\n\nCheers,\nRenard Team`,
  }),

  RESET_PASSWORD: ({ link }) => ({
    subject: "Reset Your Password",
    body: `Click the following link to reset your password: ${link}\n\nIf you didn't request this, ignore the email.`,
  }),
};
