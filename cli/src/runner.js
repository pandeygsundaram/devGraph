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

export function runTracked(cmd, args = []) {
  const tool = detectTool(cmd) || "unknown";

  // Get the starting timestamp and read current history
  const startTime = Date.now();
  const existingHistory = tool === "claude" ? readHistoryIndex() : [];

  const sessionId = startSession(tool, cmd, args);

  // Run the command with full passthrough
  const child = spawn(cmd, args, {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    // After Claude Code exits, read new entries from history
    if (tool === "claude") {
      setTimeout(() => {
        const newHistory = readHistoryIndex();
        const newEntries = newHistory.slice(existingHistory.length);

        console.error(
          `\n[Renard Debug] Found ${newEntries.length} new history entries`
        );

        if (newEntries.length > 0) {
          // Get the project and sessionId from the latest entry
          const latestEntry = newEntries[newEntries.length - 1];
          console.error(
            `[Renard Debug] Latest entry project: ${latestEntry.project}`
          );
          console.error(
            `[Renard Debug] Latest entry sessionId: ${latestEntry.sessionId}`
          );
          readClaudeConversation(
            sessionId,
            latestEntry.project,
            latestEntry.sessionId,
            newEntries
          );
        }

        endSession(sessionId, code);
        process.exit(code || 0);
      }, 500); // Small delay to ensure files are written
    } else if (tool === "gemini") {
      setTimeout(() => {
        readGeminiHistory(sessionId);
        endSession(sessionId, code);
        process.exit(code || 0);
      }, 500);
    } else {
      endSession(sessionId, code);
      process.exit(code || 0);
    }
  });

  child.on("error", (err) => {
    console.error("Error:", err.message);
    endSession(sessionId, 1);
    process.exit(1);
  });
}

// Read the history index
function readHistoryIndex() {
  try {
    const historyPath = path.join(os.homedir(), ".claude", "history.jsonl");

    if (!fs.existsSync(historyPath)) {
      return [];
    }

    const content = fs.readFileSync(historyPath, "utf8");
    return content
      .trim()
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

// Read a specific conversation from projects folder
function readClaudeConversation(
  renardSessionId,
  projectPath,
  claudeSessionId,
  historyEntries
) {
  try {
    // Convert project path to folder name (replace / with -)
    // The folder name keeps the leading dash: /home/user -> -home-user
    const projectFolder = projectPath.replace(/\//g, "-");
    const conversationDir = path.join(
      os.homedir(),
      ".claude",
      "projects",
      projectFolder
    );

    console.error(
      `[Renard Debug] Looking for conversation in: ${conversationDir}`
    );

    if (!fs.existsSync(conversationDir)) {
      console.error(
        `[Renard Debug] Directory not found, logging history entries only`
      );
      // Just log the history entries we have
      logClaudeConversation(renardSessionId, historyEntries, []);
      return;
    }

    // Find conversation file matching the session ID
    const files = fs.readdirSync(conversationDir);
    console.error(`[Renard Debug] Files in directory: ${files.join(", ")}`);

    // Look for exact session ID match first
    let conversationFile = files.find((f) => f.startsWith(claudeSessionId));

    // If not found, try to get the most recently modified .jsonl file
    if (!conversationFile) {
      const jsonlFiles = files
        .filter((f) => f.endsWith(".jsonl") && !f.startsWith("agent-"))
        .map((f) => ({
          name: f,
          mtime: fs.statSync(path.join(conversationDir, f)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (jsonlFiles.length > 0) {
        conversationFile = jsonlFiles[0].name;
      }
    }

    console.error(
      `[Renard Debug] Selected conversation file: ${conversationFile}`
    );

    if (!conversationFile) {
      console.error(`[Renard Debug] No conversation file found`);
      // Just log the history entries we have
      logClaudeConversation(renardSessionId, historyEntries, []);
      return;
    }

    // Read the conversation file
    const conversationPath = path.join(conversationDir, conversationFile);
    const conversationData = fs.readFileSync(conversationPath, "utf8");
    const messages = conversationData
      .trim()
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    console.error(
      `[Renard Debug] Found ${messages.length} messages in conversation`
    );

    // Log the complete conversation
    logClaudeConversation(renardSessionId, historyEntries, messages);
  } catch (e) {
    console.error(`[Renard Debug] Error: ${e.message}`);
    // Fallback: just log the history entries
    logClaudeConversation(renardSessionId, historyEntries, []);
  }
}

// Read Gemini's conversation history from ~/.gemini/tmp/
function readGeminiHistory(sessionId) {
  try {
    const homeDir = os.homedir();
    const geminiTmpDir = path.join(homeDir, ".gemini", "tmp");

    if (!fs.existsSync(geminiTmpDir)) {
      console.error(`[Renard Debug] Gemini tmp directory not found`);
      return;
    }

    // Find the most recent directory (they're named with hashes)
    const dirs = fs
      .readdirSync(geminiTmpDir)
      .filter((d) => {
        const fullPath = path.join(geminiTmpDir, d);
        return fs.statSync(fullPath).isDirectory() && d !== "bin";
      })
      .map((d) => ({
        name: d,
        path: path.join(geminiTmpDir, d),
        mtime: fs.statSync(path.join(geminiTmpDir, d)).mtime,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (dirs.length === 0) {
      console.error(`[Renard Debug] No Gemini session directories found`);
      return;
    }

    const latestDir = dirs[0].path;
    console.error(`[Renard Debug] Reading Gemini history from: ${latestDir}`);

    // Read logs.json for user messages
    const logsFile = path.join(latestDir, "logs.json");
    if (fs.existsSync(logsFile)) {
      const logsData = JSON.parse(fs.readFileSync(logsFile, "utf8"));

      // Read chat files for assistant responses
      const chatsDir = path.join(latestDir, "chats");
      let chatData = [];

      if (fs.existsSync(chatsDir)) {
        const chatFiles = fs
          .readdirSync(chatsDir)
          .filter((f) => f.endsWith(".json"))
          .map((f) => ({
            name: f,
            path: path.join(chatsDir, f),
            mtime: fs.statSync(path.join(chatsDir, f)).mtime,
          }))
          .sort((a, b) => b.mtime - a.mtime);

        if (chatFiles.length > 0) {
          chatData = JSON.parse(fs.readFileSync(chatFiles[0].path, "utf8"));
        }
      }

      // Import logger function
      logGeminiConversation(sessionId, logsData, chatData);
    }
  } catch (e) {
    console.error(`[Renard Debug] Error reading Gemini history: ${e.message}`);
  }
}
