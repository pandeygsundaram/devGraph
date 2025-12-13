import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { parseOutput } from "./parser.js";

const DIR = path.join(os.homedir(), ".renard");
const FILE = path.join(DIR, "logs.jsonl");
fs.mkdirSync(DIR, { recursive: true });

export function startSession(tool, cmd, args) {
  const id = crypto.randomUUID();
  write({
    type: "session_start",
    sessionId: id,
    tool,
    cmd,
    args,
    fullCommand: `${cmd} ${args.join(" ")}`,
  });
  return id;
}

export function storeUserInput(sessionId, text, timestamp) {
  if (!text || !text.trim()) return;

  write({
    type: "user_input",
    sessionId,
    text: text.trim(),
    inputTimestamp: timestamp,
  });
}

export function storeRawOutput(sessionId, tool, rawOutput, userInputs) {
  // Parse the output based on the tool
  const parsedMessages = parseOutput(
    tool,
    rawOutput,
    userInputs.map((u) => u.text)
  );

  // Log each parsed message
  for (const msg of parsedMessages) {
    write({
      type: msg.role === "user" ? "message_user" : "message_assistant",
      sessionId,
      role: msg.role,
      text: msg.text,
      charCount: msg.text.length,
    });
  }

  // Also store the raw output for debugging
  write({
    type: "raw_output",
    sessionId,
    text: rawOutput,
    charCount: rawOutput.length,
  });
}

export function logClaudeConversation(
  sessionId,
  historyEntries,
  conversationMessages
) {
  try {
    console.error(`\n[Renard Debug] ===== LOGGING CONVERSATION =====`);
    console.error(`[Renard Debug] Session ID: ${sessionId}`);
    console.error(`[Renard Debug] History entries: ${historyEntries.length}`);
    console.error(
      `[Renard Debug] Conversation messages: ${conversationMessages.length}`
    );

    // First, let's see what history entries look like
    historyEntries.forEach((entry, i) => {
      console.error(
        `[Renard Debug] History[${i}]: display="${entry.display}", sessionId="${entry.sessionId}"`
      );
    });

    // Log user queries from history entries
    for (const entry of historyEntries) {
      if (entry.display && entry.display.trim()) {
        // Skip exit command
        if (entry.display.trim().toLowerCase() === "exit") {
          console.error(`[Renard Debug] SKIPPING exit command`);
          continue;
        }

        console.error(
          `[Renard Debug] WRITING user message from history: ${entry.display.slice(
            0,
            50
          )}...`
        );
        write({
          type: "message_user",
          sessionId,
          role: "user",
          text: entry.display.trim(),
          timestamp: entry.timestamp,
          claudeSessionId: entry.sessionId,
          project: entry.project,
        });
      }
    }

    // Log assistant responses from conversation messages
    for (const msg of conversationMessages) {
      console.error(
        `[Renard Debug] Message type: ${msg.type}, isMeta: ${msg.isMeta}`
      );

      // Check if it's a user message
      if (msg.type === "user" && msg.message && msg.message.content) {
        // Skip meta messages, command messages, and local command output
        if (
          !msg.isMeta &&
          !msg.message.content.includes("<command-name>") &&
          !msg.message.content.includes("<local-command-stdout>")
        ) {
          const content = msg.message.content;
          console.error(
            `[Renard Debug] WRITING user message from conversation: ${content.slice(
              0,
              50
            )}...`
          );
          write({
            type: "message_user",
            sessionId,
            role: "user",
            text: content,
            timestamp: new Date(msg.timestamp).getTime(),
            claudeSessionId: msg.sessionId,
          });
        } else {
          console.error(
            `[Renard Debug] SKIPPING user message (meta or command)`
          );
        }
      }

      // Check if it's an assistant message
      if (msg.type === "assistant" && msg.message && msg.message.content) {
        const content = extractClaudeContent(msg.message.content);

        if (content) {
          console.error(
            `[Renard Debug] WRITING assistant message: ${content.slice(
              0,
              50
            )}...`
          );
          write({
            type: "message_assistant",
            sessionId,
            role: "assistant",
            text: content,
            charCount: content.length,
            timestamp: new Date(msg.timestamp).getTime(),
          });
        } else {
          console.error(
            `[Renard Debug] No content extracted from assistant message`
          );
        }
      }
    }

    console.error(`[Renard Debug] ===== FINISHED LOGGING =====\n`);
  } catch (e) {
    console.error(
      `[Renard Debug] ERROR in logClaudeConversation: ${e.message}`
    );
    console.error(e.stack);
  }
}

// Extract text content from Claude Code message format
function extractClaudeContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.type === "text") return item.text;
        if (item.type === "thinking") return ""; // Skip thinking blocks
        if (item.type === "tool_use") return `[Used tool: ${item.name}]`;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

export function logGeminiConversation(sessionId, logsData, chatData) {
  try {
    console.error(`\n[Renard Debug] ===== LOGGING GEMINI CONVERSATION =====`);
    console.error(`[Renard Debug] Session ID: ${sessionId}`);
    console.error(`[Renard Debug] Logs entries: ${logsData.length}`);
    console.error(`[Renard Debug] Chat data exists: ${!!chatData}`);

    // Chat data has the full conversation in a messages array
    let messages = [];

    if (chatData && chatData.messages) {
      messages = chatData.messages;
      console.error(
        `[Renard Debug] Found ${messages.length} messages in chat data`
      );
    } else if (Array.isArray(chatData)) {
      messages = chatData;
    } else {
      messages = logsData;
    }

    for (const msg of messages) {
      console.error(`[Renard Debug] Processing message type: ${msg.type}`);

      if (msg.type === "user") {
        const text = msg.content || msg.message || msg.text;
        if (text && text.trim()) {
          console.error(
            `[Renard Debug] WRITING user message: ${text.slice(0, 50)}...`
          );
          write({
            type: "message_user",
            sessionId,
            role: "user",
            text: text.trim(),
            timestamp: new Date(msg.timestamp).getTime(),
            geminiSessionId: chatData.sessionId || msg.sessionId,
          });
        }
      } else if (
        msg.type === "gemini" ||
        msg.type === "assistant" ||
        msg.role === "model"
      ) {
        const text = msg.content || msg.message || msg.text;
        if (text && text.trim()) {
          console.error(
            `[Renard Debug] WRITING assistant message: ${text.slice(0, 50)}...`
          );
          write({
            type: "message_assistant",
            sessionId,
            role: "assistant",
            text: text.trim(),
            charCount: text.trim().length,
            timestamp: new Date(msg.timestamp).getTime(),
          });
        }
      }
    }

    console.error(`[Renard Debug] ===== FINISHED LOGGING GEMINI =====\n`);
  } catch (e) {
    console.error(
      `[Renard Debug] ERROR in logGeminiConversation: ${e.message}`
    );
    console.error(e.stack);
  }
}

export function parseClaudeHistory(sessionId, conversationData) {
  try {
    const lines = conversationData.trim().split("\n");

    for (const line of lines) {
      try {
        const msg = JSON.parse(line);

        // Claude Code JSONL format has messages with role and content
        if (msg.type === "message" && msg.message) {
          const role = msg.message.role;
          const content = extractContent(msg.message.content);

          if (content) {
            write({
              type: role === "user" ? "message_user" : "message_assistant",
              sessionId,
              role,
              text: content,
              charCount: content.length,
            });
          }
        }
      } catch (e) {
        // Skip invalid lines
      }
    }
  } catch (e) {
    console.error("Failed to parse Claude history:", e.message);
  }
}

// Extract text content from Claude Code message format
function extractContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.type === "text") return item.text;
        if (item.type === "tool_use") return `[Tool: ${item.name}]`;
        if (item.type === "tool_result") return ""; // Skip tool results in summary
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

export function endSession(sessionId, code) {
  write({
    type: "session_end",
    sessionId,
    exitCode: code,
    success: code === 0,
  });
}

export function readLogs(options = {}) {
  if (!fs.existsSync(FILE)) {
    return [];
  }

  const lines = fs.readFileSync(FILE, "utf8").trim().split("\n");
  let logs = lines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  // Apply filters
  if (options.tool) {
    logs = logs.filter((log) => log.tool === options.tool);
  }

  if (options.sessionId) {
    logs = logs.filter((log) => log.sessionId === options.sessionId);
  }

  if (options.last) {
    logs = logs.slice(-options.last);
  }

  return logs;
}

export function getSessionMessages(sessionId) {
  const logs = readLogs({ sessionId });
  return logs.filter(
    (log) => log.type === "message_user" || log.type === "message_assistant"
  );
}

export function clearLogs() {
  if (fs.existsSync(FILE)) {
    fs.unlinkSync(FILE);
    return true;
  }
  return false;
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
