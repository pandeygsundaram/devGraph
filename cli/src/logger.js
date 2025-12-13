import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const DIR = path.join(os.homedir(), ".renard");
const FILE = path.join(DIR, "logs.jsonl");
fs.mkdirSync(DIR, { recursive: true });

export function startSession(tool, cmd, args) {
  const id = crypto.randomUUID();
  write({ type: "session_start", sessionId: id, tool, cmd, args });
  return id;
}

export function logEvent(sessionId, role, text) {
  write({ type: "message", sessionId, role, text });
}

export function endSession(sessionId, code) {
  write({ type: "session_end", sessionId, exitCode: code });
}

function write(obj) {
  fs.appendFileSync(
    FILE,
    JSON.stringify({
      timestamp: Date.now(),
      date: new Date().toISOString(),
      ...obj,
    }) + "\n"
  );
}
