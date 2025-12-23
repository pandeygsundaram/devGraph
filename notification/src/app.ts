import express from "express";
import { queueEmail } from "./utils/apis/sendEmail";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).send("🚀 Notification service is running");
});

app.post("/api/email/queue", queueEmail);

export default app;
