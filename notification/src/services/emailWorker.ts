import { sendMail } from "./consumer";
import { connectToRabbitMQ } from "./publisher";

const QUEUE_NAME = "email_queue";

export const startEmailWorker = async () => {
  const channel = await connectToRabbitMQ();

  if (!channel) {
    console.error("Worker failed to connect to RabbitMQ. Exiting...");
    return;
  }

  console.log("👷 Email Worker started. Waiting for messages...");

  // Prefetch(1) ensures the worker only processes 1 email at a time
  // (prevents overwhelming SMTP server)
  channel.prefetch(1);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      try {
        const content = JSON.parse(msg.content.toString());
        const { email, templateType, data } = content;

        console.log(`⚙️ Processing email for: ${email}`);

        // Call the actual Nodemailer service
        await sendMail(email, templateType, data);

        // Acknowledge message (Removes it from queue)
        channel.ack(msg);
      } catch (error) {
        console.error("Worker Error:", error);

        // Negative Acknowledge (requeue = false means discard or send to dead letter)
        // Set requeue = true if you want it to retry indefinitely
        channel.nack(msg, false, false);
      }
    }
  });
};
