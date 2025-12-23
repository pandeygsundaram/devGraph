// src/controllers/emailController.ts
import { Request, Response } from "express";
import { publishEmailToQueue } from "../../services/publisher";
import { EmailTemplateType } from "../templates";

export const queueEmail = async (req: Request, res: Response) => {
  try {
    const { userId, email, templateType, data } = req.body;

    // Basic Validation
    if (!email || !templateType || !data) {
      return res.status(400).json({
        error: "Missing required fields: email, templateType, or data",
      });
    }

    
    // Publish to RabbitMQ
    await publishEmailToQueue({
      userId,
      email,
      templateType: templateType as EmailTemplateType,
      data,
    });

    // Respond immediately (Fire and Forget)
    res.status(202).json({
      message: "Email request accepted and queued",
      status: "queued",
    });
  } catch (error) {
    console.error("Queue Email Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
