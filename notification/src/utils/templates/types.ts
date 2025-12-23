export type EmailTemplateType = "OTP" | "WELCOME" | "RESET_PASSWORD";

export type TemplateMap = {
  OTP: {
    name?: string;
    otp: string;
    expiryMinutes?: number;
  };
  WELCOME: {
    name: string;
  };
  RESET_PASSWORD: { link: string };
};
