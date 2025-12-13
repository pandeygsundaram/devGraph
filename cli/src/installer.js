import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const TOOLS = ["claude", "openai", "gemini"];

export function install() {
  console.log("Installing renard…");
  console.log("Searching for CLI tools...\n");

  let foundAny = false;

  TOOLS.forEach((tool) => {
    const bin = findBin(tool);

    if (!bin) {
      console.log(`⊘ ${tool} not found in PATH`);
      return;
    }

    console;

    foundAny = true;
    const dir = path.dirname(bin);
    const real = path.join(dir, `${tool}.real`);

    if (fs.existsSync(real)) {
      console.log(`✔ ${tool} already hooked`);
      return;
    }

    try {
      fs.renameSync(bin, real);

      // Get the shim file path
      const shimPath = getShimPath(tool);

      fs.copyFileSync(shimPath, bin);
      fs.chmodSync(bin, 0o755);
      console.log(`✔ hooked ${tool}`);
    } catch (e) {
      if (e.code === "EACCES") {
        console.error(`✖ ${tool}: Permission denied. Try running with sudo`);
      } else {
        console.error(`✖ failed to hook ${tool}:`, e.message);
      }
    }
  });

  if (!foundAny) {
    console.log("\n⚠ No LLM CLIs found in PATH");
    console.log("Supported tools: claude, openai, gemini");
    console.log("\nMake sure you have at least one installed:");
    console.log("  - Claude: npm install -g @anthropic-ai/claude-cli");
    console.log("  - Gemini: pip install google-generativeai");
    console.log("  - OpenAI: pip install openai");
  }
}

export function uninstall() {
  let uninstalledAny = false;

  TOOLS.forEach((tool) => {
    const bin = findBin(tool);
    if (!bin) return;

    const dir = path.dirname(bin);
    const real = path.join(dir, `${tool}.real`);

    if (fs.existsSync(real)) {
      try {
        fs.renameSync(real, bin);
        console.log(`✔ restored ${tool}`);
        uninstalledAny = true;
      } catch (e) {
        if (e.code === "EACCES") {
          console.error(`✖ ${tool}: Permission denied. Try running with sudo`);
        } else {
          console.error(`✖ failed to restore ${tool}:`, e.message);
        }
      }
    }
  });

  if (!uninstalledAny) {
    console.log("No hooked tools found");
  }
}

export function status() {
  console.log("\nRenard Status:");
  console.log("─".repeat(40));

  let foundAny = false;

  TOOLS.forEach((tool) => {
    const bin = findBin(tool);

    if (!bin) {
      return; // Don't show not installed tools
    }

    foundAny = true;
    const dir = path.dirname(bin);
    const real = path.join(dir, `${tool}.real`);
    const tracked = fs.existsSync(real);

    const status = tracked ? "✓ tracked" : "✗ not tracked";
    const location = bin;

    console.log(`${tool.padEnd(10)} ${status.padEnd(15)} ${location}`);
  });

  if (!foundAny) {
    console.log("No LLM CLIs found in PATH");
  }

  console.log("─".repeat(40));
}

function findBin(cmd) {
  try {
    return execSync(`command -v ${cmd}`, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function getShimPath(tool) {
  // Get the directory of this module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Go up to project root and into shims
  return path.join(__dirname, "..", "shims", tool);
}
