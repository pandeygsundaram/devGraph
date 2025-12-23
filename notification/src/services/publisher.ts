// src/services/mqService.ts
import amqp from "amqplib";
import config from "../config";
import { EmailTemplateType, TemplateMap } from "../utils/templates/index";

let channel: amqp.Channel | null = null;
let connection: amqp.ChannelModel | null = null;

const QUEUE_NAME = "email_queue";

// Initialize RabbitMQ Connection
export const connectToRabbitMQ = async () => {
  try {
    if (channel) return channel;

    // Connect to RabbitMQ Server
    connection = await amqp.connect(config.RABBITMQ_URL || "amqp://localhost");
    channel = await connection.createChannel();

    // Assert Queue (Ensure it exists)
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log("🐰 Connected to RabbitMQ");

    // Handle connection close
    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      channel = null;
      connection = null;
      setTimeout(connectToRabbitMQ, 5000);
    });

    return channel;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    return null;
  }
};

// Publisher Function
export const publishEmailToQueue = async <
  T extends EmailTemplateType
>(payload: {
  email: string;
  userId?: string;
  templateType: T;
  data: TemplateMap[T];
}) => {
  if (!channel) {
    await connectToRabbitMQ();
  }

  if (channel) {
    // Send to queue
    // persistent: true saves message to disk if RabbitMQ crashes
    const sent = channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    if (sent) {
      console.log(
        `📩 Queued email (${payload.templateType}) for ${payload.email}`
      );
    } else {
      console.error("Failed to enqueue email message");
    }
  } else {
    console.error("RabbitMQ channel not available");
  }
};
