import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

import { EmailTemplateType } from "./utils/templates";
import { publishEmailToQueue } from "./services/publisher";

const PROTO_PATH = path.join(__dirname, "../proto/notification.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDefinition) as any;

// The Implementation of the RPC method
const sendEmail = async (call: any, callback: any) => {
  try {
    const { userId, email, templateType, dataJson } = call.request;

    // Parse the JSON string back to an object
    const data = JSON.parse(dataJson);

    console.log(`[gRPC] Received request: ${templateType} for ${email}`);

    // Call your existing RabbitMQ publisher
    await publishEmailToQueue({
      userId,
      email,
      templateType: templateType as EmailTemplateType,
      data,
    });

    callback(null, { success: true, message: "Email queued successfully" });
  } catch (error) {
    console.error("[gRPC] Error:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal Server Error",
    });
  }
};

// Start the gRPC Server
export const startGrpcServer = () => {
  const server = new grpc.Server();

  server.addService(
    notificationProto.notification.NotificationService.service,
    {
      SendEmail: sendEmail,
    }
  );

  const PORT = process.env.GRPC_PORT || "50051";

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("Failed to bind gRPC server:", error);
        return;
      }
      console.log(`🛡️ gRPC Server running on port ${port}`);
    }
  );
};
