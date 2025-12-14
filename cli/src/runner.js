import { spawn } from "child_process";
import {
  startSession,
  endSession,
  logClaudeConversation,
  logGeminiConversation,
} from "./logger.js";
import { detectTool } from "./detect.js";
import fs from "fs";
import os from "os";
import path from "path";
import { sendSessionToServer } from "./sender.js";

/* =====================
   ENTRY
===================== */

export function runTracked(cmd, args = []) {
  const tool = detectTool(cmd) || "unknown";
  const existingHistory = tool === "claude" ? readHistoryIndex() : [];
  const sessionId = startSession(tool, cmd, args);

  const child = spawn(cmd, args, {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    setTimeout(async () => {
      try {
        if (tool === "claude") {
          await handleClaudeExit(sessionId, existingHistory, code);
        } else if (tool === "gemini") {
          readGeminiHistory(sessionId);
          endSession(sessionId, code);
          await sendSessionToServer(sessionId);
          process.exit(code || 0);
        } else {
          endSession(sessionId, code);
          await sendSessionToServer(sessionId);
          process.exit(code || 0);
        }
      } catch (e) {
        console.error("[Renard] Fatal exit error:", e.message);
        process.exit(code || 1);
      }
    }, 600);
  });

  child.on("error", async (err) => {
    console.error("Error:", err.message);
    endSession(sessionId, 1);
    await sendSessionToServer(sessionId);
    process.exit(1);
  });
}

/* =====================
   CLAUDE EXIT HANDLER
===================== */

async function handleClaudeExit(sessionId, existingHistory, code) {
  const newHistory = readHistoryIndex();
  const newEntries = newHistory.slice(existingHistory.length);

  console.error(
    `[Renard Debug] Found ${newEntries.length} new Claude history entries`
  );

  if (newEntries.length > 0) {
    const latest = newEntries[newEntries.length - 1];
    readClaudeConversation(
      sessionId,
      latest.project,
      latest.sessionId,
      newEntries
    );
  }

  endSession(sessionId, code);
  await sendSessionToServer(sessionId);
  process.exit(code || 0);
}

/* =====================
   HISTORY HELPERS
===================== */

function readHistoryIndex() {
  try {
    const file = path.join(os.homedir(), ".claude", "history.jsonl");
    if (!fs.existsSync(file)) return [];

    return fs
      .readFileSync(file, "utf8")
      .trim()
      .split("\n")
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/* =====================
   CLAUDE CONVERSATION
===================== */

function readClaudeConversation(
  renardSessionId,
  projectPath,
  claudeSessionId,
  historyEntries
) {
  try {
    const projectFolder = projectPath.replace(/\//g, "-");
    const dir = path.join(os.homedir(), ".claude", "projects", projectFolder);

    if (!fs.existsSync(dir)) {
      logClaudeConversation(renardSessionId, historyEntries, []);
      return;
    }

    const files = fs.readdirSync(dir);
    let file = files.find((f) => f.startsWith(claudeSessionId));

    if (!file) {
      file = files
        .filter((f) => f.endsWith(".jsonl") && !f.startsWith("agent-"))
        .map((f) => ({
          name: f,
          mtime: fs.statSync(path.join(dir, f)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime)?.[0]?.name;
    }

    if (!file) {
      logClaudeConversation(renardSessionId, historyEntries, []);
      return;
    }

    const messages = fs
      .readFileSync(path.join(dir, file), "utf8")
      .trim()
      .split("\n")
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    logClaudeConversation(renardSessionId, historyEntries, messages);
  } catch (e) {
    console.error("[Renard Debug] Claude parse error:", e.message);
    logClaudeConversation(renardSessionId, historyEntries, []);
  }
}

/* =====================
   GEMINI HISTORY (FIXED)
===================== */

function readGeminiHistory(sessionId) {
  try {
    const baseDir = path.join(os.homedir(), ".gemini", "tmp");
    if (!fs.existsSync(baseDir)) return;

    const sessionDir = findBestGeminiSessionDir(baseDir);

    if (!sessionDir) {
      console.error("[Renard Debug] No valid Gemini conversation found");
      return;
    }

    console.error(`[Renard Debug] Reading Gemini session from: ${sessionDir}`);

    const logsFile = path.join(sessionDir, "logs.json");
    const chatsDir = path.join(sessionDir, "chats");

    const logsData = fs.existsSync(logsFile)
      ? JSON.parse(fs.readFileSync(logsFile, "utf8"))
      : [];

    let chatData = [];

    if (fs.existsSync(chatsDir)) {
      const files = fs
        .readdirSync(chatsDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({
          path: path.join(chatsDir, f),
          mtime: fs.statSync(path.join(chatsDir, f)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (files.length) {
        chatData = JSON.parse(fs.readFileSync(files[0].path, "utf8"));
      }
    }

    logGeminiConversation(sessionId, logsData, chatData);
  } catch (e) {
    console.error("[Renard Debug] Gemini error:", e.message);
  }
}

/* =====================
   GEMINI SESSION PICKER
===================== */

function findBestGeminiSessionDir(baseDir) {
  const dirs = fs
    .readdirSync(baseDir)
    .map((d) => ({
      name: d,
      path: path.join(baseDir, d),
      mtime: fs.statSync(path.join(baseDir, d)).mtime,
    }))
    .filter((d) => fs.statSync(d.path).isDirectory())
    .sort((a, b) => b.mtime - a.mtime);

  for (const dir of dirs) {
    const chatsDir = path.join(dir.path, "chats");
    if (!fs.existsSync(chatsDir)) continue;

    const files = fs.readdirSync(chatsDir).filter((f) => f.endsWith(".json"));
    if (!files.length) continue;

    try {
      const content = JSON.parse(
        fs.readFileSync(path.join(chatsDir, files[0]), "utf8")
      );

      const msgs = content?.messages || content;
      if (
        Array.isArray(msgs) &&
        msgs.some(
          (m) =>
            typeof (m.content || m.text) === "string" &&
            (m.content || m.text).length > 30
        )
      ) {
        return dir.path; // ✅ REAL conversation
      }
    } catch {}
  }

  return null;
}
