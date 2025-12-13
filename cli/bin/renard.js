#!/usr/bin/env node
import { Command } from "commander";
import { install, uninstall, status } from "../src/installer.js";
import { runTracked } from "../src/runner.js";

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

// INTERNAL: used by shims
program
  .command("run <realCmd> [args...]")
  .allowUnknownOption(true)
  .action(runTracked);

program
  .command("logs")
  .description("View collected LLM CLI logs")
  .option("--tool <name>", "Filter by tool")
  .option("--last <n>", "Show last N entries", "20")
  .action(async (opts) => {
    const fs = await import("fs");
    const os = await import("os");
    const path = await import("path");

    const file = path.join(os.homedir(), ".renard", "logs.jsonl");
    if (!fs.existsSync(file)) {
      console.log("No logs found");
      return;
    }

    const lines = fs
      .readFileSync(file, "utf8")
      .trim()
      .split("\n")
      .slice(-Number(opts.last));

    for (const line of lines) {
      const entry = JSON.parse(line);
      if (opts.tool && entry.tool !== opts.tool) continue;

      if (entry.type === "message") {
        console.log(
          `[${new Date(entry.timestamp).toLocaleTimeString()}] ` +
            `[${formatDate(entry)}] ` +
            `[${entry.tool}] ${entry.role}: ${entry.text}`
        );
      }
    }
  });

program
  .command("clear")
  .description("Clear all collected logs")
  .option("-y, --yes", "Skip confirmation")
  .action(async (opts) => {
    const fs = await import("fs");
    const os = await import("os");
    const path = await import("path");
    const readline = await import("readline");

    const dir = path.join(os.homedir(), ".renard");
    const file = path.join(dir, "logs.jsonl");

    if (!fs.existsSync(file)) {
      console.log("No logs to clear");
      return;
    }

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

    try {
      fs.unlinkSync(file);
      console.log("Logs cleared successfully");
    } catch (e) {
      console.error("Failed to clear logs:", e.message);
    }
  });

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

function formatDate(entry) {
  // Prefer ISO date if available
  if (entry.date) {
    const d = new Date(entry.date);
    if (!isNaN(d)) {
      return d.toISOString().split("T")[0];
    }
  }

  // Fallback to timestamp
  if (entry.timestamp) {
    return new Date(entry.timestamp).toISOString().split("T")[0];
  }

  return "unknown-date";
}
