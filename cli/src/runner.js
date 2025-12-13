import { spawn } from "child_process";
import { startSession, logEvent, endSession } from "./logger.js";
import { detectTool } from "./detect.js";

export function runTracked(cmd, args = []) {
  const tool = detectTool(cmd) || "unknown";
  const sessionId = startSession(tool, cmd, args);

  const child = spawn(cmd, args, {
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env,
  });

  // Log user input (for interactive tools)
  process.stdin.on("data", (data) => {
    const text = data.toString();
    logEvent(sessionId, "user", text);
    child.stdin.write(data);
  });

  // Log command output
  child.stdout.on("data", (data) => {
    const text = data.toString();
    logEvent(sessionId, "assistant", text);
    process.stdout.write(data);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  child.on("exit", (code) => {
    endSession(sessionId, code);
    process.exit(code);
  });
}
