#!/usr/bin/env node
import { Command } from "commander";
import { install, uninstall, status } from "../src/installer.js";
import { runTracked } from "../src/runner.js";
import { clearLogs } from "../src/logger.js";
import fs from "fs";
import os from "os";
import path from "path";
import { login, logout } from "../src/auth.js";

const program = new Command();

program
  .name("renard")
  .description("Track LLM CLI interactions")
  .version("0.1.0");

program
  .command("install")
  .description("Hook Claude, OpenAI and Gemini CLIs")
  .action(install);

program
  .command("uninstall")
  .description("Restore original CLIs")
  .action(uninstall);

program.command("status").description("Show tracked CLIs").action(status);

program
  .command("run <realCmd> [args...]")
  .allowUnknownOption(true)
  .action(runTracked);

program
  .command("logs")
  .description("View collected LLM CLI logs")
  .option("--last <n>", "Show last N entries", "50")
  .action((opts) => {
    const logFile = path.join(os.homedir(), ".renard", "logs.jsonl");

    if (!fs.existsSync(logFile)) {
      console.log("No logs found");
      return;
    }

    const lines = fs.readFileSync(logFile, "utf8").trim().split("\n");
    const logs = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    console.log(`\n${"=".repeat(80)}`);
    console.log(`RENARD LOGS - Last ${opts.last} entries`);
    console.log(`${"=".repeat(80)}\n`);

    const recentLogs = logs.slice(-Number(opts.last));

    for (const log of recentLogs) {
      const date = new Date(log.timestamp).toLocaleString();

      if (log.type === "session_start") {
        console.log(`\n${"─".repeat(80)}`);
        console.log(`🚀 SESSION START [${log.tool}] - ${date}`);
        console.log(`   Command: ${log.fullCommand || log.cmd}`);
        console.log(`   Session ID: ${log.sessionId}`);
      } else if (log.type === "message_user") {
        console.log(`\n👤 USER [${date}]:`);
        console.log(`   ${log.text}`);
      } else if (log.type === "message_assistant") {
        console.log(`\n🤖 ASSISTANT [${date}]:`);
        const text =
          log.text.length > 500 ? log.text.slice(0, 500) + "..." : log.text;
        console.log(`   ${text}`);
      } else if (log.type === "session_end") {
        console.log(
          `\n🏁 SESSION END - Exit code: ${log.exitCode} (${
            log.success ? "✓" : "✗"
          })`
        );
        console.log(`${"─".repeat(80)}`);
      }
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(`Total entries: ${logs.length}`);
    console.log(`Showing: ${recentLogs.length}`);
    console.log(`${"=".repeat(80)}\n`);
  });

program
  .command("clear")
  .description("Clear all collected logs")
  .option("-y, --yes", "Skip confirmation")
  .action(async (opts) => {
    const readline = await import("readline");

    if (!opts.yes) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) =>
        rl.question(
          "This will permanently delete all renard logs. Continue? (y/N) ",
          resolve
        )
      );

      rl.close();

      if (!/^y(es)?$/i.test(answer.trim())) {
        console.log("Aborted");
        return;
      }
    }

    const cleared = clearLogs();
    if (cleared) {
      console.log("✓ Logs cleared successfully");
    } else {
      console.log("No logs to clear");
    }
  });
program.command("login").description("Authenticate Renard CLI").action(login);

program.command("logout").description("Logout Renard CLI").action(logout);

function printBanner() {
  console.log(`

██████╗ ███████╗███╗   ██╗ █████╗ ██████╗ ██████╗ 
██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔══██╗██╔══██╗
██████╔╝█████╗  ██╔██╗ ██║███████║██████╔╝██║  ██║
██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║██╔══██╗██║  ██║
██║  ██║███████╗██║ ╚████║██║  ██║██║  ██║██████╔╝
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 

🦊  Renard — understanding what work actually happened
`);
}

if (process.argv.length <= 2) {
  printBanner();
}

program.parse();
