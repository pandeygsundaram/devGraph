import nodemailer from "nodemailer";
import config from "../config";
import {
  mailTemplates,
  EmailTemplateType,
  TemplateMap,
} from "../utils/templates/index";

// Create transport ONCE (Performance Optimization)
const transport = nodemailer.createTransport({
  port: Number(config.MAILER.PORT),
  host: config.MAILER.HOST,
  secure: config.MAILER.SECURE === "true", // Fixed boolean logic
  auth: {
    user: config.MAILER.GMAIL_USER,
    pass: config.MAILER.GMAIL_PASSWORD,
  },
});

export const sendMail = async <T extends EmailTemplateType>(
  email: string,
  templateType: T,
  data: TemplateMap[T]
) => {
  try {
    const { subject, body } = mailTemplates[templateType](data);

    await transport.sendMail({
      from: `"Renard" <${config.MAILER.GMAIL_USER}>`,
      to: email,
      subject,
      html: body,
    });

    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
    throw error; // Throw so RabbitMQ knows to retry or dead-letter
  }
};
