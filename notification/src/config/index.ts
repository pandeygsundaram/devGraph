import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  MAILER: {
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    HOST: process.env.MAILER_HOST,
    PORT: process.env.MAILER_PORT,
    SECURE: process.env.MAILER_SECURE,
  },
};
