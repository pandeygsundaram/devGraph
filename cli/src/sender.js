import fs from "fs";
import os from "os";
import path from "path";
import fetch from "node-fetch";
import { getAuth } from "./auth.js";

const LOG_FILE = path.join(os.homedir(), ".renard", "logs.jsonl");
const API_BASE = "https://api.renard.live/api";
const CHUNK_SIZE = 200;

/* =========================
   SEND ONE CLI SESSION
========================= */

export async function sendSessionToServer(sessionId) {
  const auth = getAuth();

  if (!auth?.token || !auth?.team?.id) {
    console.log("[Renard] Not authenticated, skipping CLI upload");
    return;
  }

  if (!fs.existsSync(LOG_FILE)) return;

  const raw = fs.readFileSync(LOG_FILE, "utf8").trim();
  if (!raw) return;

  const lines = raw.split("\n");

  const messages = lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(
      (l) =>
        l &&
        l.sessionId === sessionId &&
        (l.type === "message_user" || l.type === "message_assistant") &&
        typeof l.text === "string" &&
        l.text.trim().length > 0
    )
    .map((l) => ({
      activityType: "chat",
      teamId: auth.team.id,
      content: l.text.trim(),

      // 🔒 SAFE metadata only
      metadata: {
        source: "cli",
        role: l.role === "assistant" ? "assistant" : "user",
        tool: String(l.tool || "unknown"),
        sessionId: l.sessionId,
        capturedAt: new Date(l.timestamp).toISOString(),
      },
    }));

  if (messages.length === 0) {
    console.log("[Renard] No valid CLI messages to upload");
    return;
  }

  console.log(`[Renard] Uploading ${messages.length} CLI messages`);

  try {
    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);

      const res = await fetch(`${API_BASE}/messages/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: chunk }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
      }

      console.log(
        `[Renard] Uploaded chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${
          chunk.length
        })`
      );
    }

    console.log("[Renard] CLI messages uploaded successfully");
  } catch (err) {
    console.error("[Renard] Failed to upload CLI messages");
    console.error(err.message);
  }
}
