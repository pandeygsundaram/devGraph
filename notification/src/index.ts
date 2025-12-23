// index.ts
import app from "./app";
import { startGrpcServer } from "./grpcServer";
import { startEmailWorker } from "./services/emailWorker";
import express from "express";

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Start Express API
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start Background Worker
startEmailWorker().catch(console.error);
startGrpcServer();
