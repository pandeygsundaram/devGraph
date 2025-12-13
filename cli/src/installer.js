import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const TOOLS = ["claude", "openai", "gemini"];

export function install() {
  console.log("Installing renard…");

  TOOLS.forEach((tool) => {
    const bin = findBin(tool);

    if (!bin) {
      console.log(`⚠ ${tool} not found in PATH`);
      return;
    }

    const dir = path.dirname(bin);
    const real = path.join(dir, `${tool}.real`);

    if (fs.existsSync(real)) {
      console.log(`✔ ${tool} already hooked`);
      return;
    }

    try {
      fs.renameSync(bin, real);
      fs.copyFileSync(new URL(`../shims/${tool}`, import.meta.url), bin);
      fs.chmodSync(bin, 0o755);
      console.log(`✔ hooked ${tool}`);
    } catch (e) {
      console.error(`✖ failed to hook ${tool}:`, e.message);
    }
  });
}

export function uninstall() {
  TOOLS.forEach((tool) => {
    const bin = findBin(tool);
    if (!bin) return;

    const dir = path.dirname(bin);
    const real = path.join(dir, `${tool}.real`);

    if (fs.existsSync(real)) {
      fs.renameSync(real, bin);
      console.log(`✔ restored ${tool}`);
    }
  });
}

export function status() {
  TOOLS.forEach((tool) => {
    const bin = findBin(tool);
    if (!bin) return;

    const tracked = fs.existsSync(`${bin}.real`);
    console.log(`${tool}: ${tracked ? "tracked" : "not tracked"}`);
  });
}

function findBin(cmd) {
  try {
    return execSync(`command -v ${cmd}`).toString().trim();
  } catch {
    return null;
  }
}
