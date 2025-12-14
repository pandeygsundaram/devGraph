import http from "http";
import fs from "fs";
import os from "os";
import path from "path";

const AUTH_DIR = path.join(os.homedir(), ".renard");
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

/* ======================
   AUTH HELPERS
====================== */

export function getAuth() {
  if (!fs.existsSync(AUTH_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
  } catch {
    return null;
  }
}

export function logout() {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
    console.log("✓ Logged out successfully");
  } else {
    console.log("Not logged in");
  }
}

/* ======================
   LOGIN FLOW
====================== */

export async function login() {
  const existingAuth = getAuth();

  // ✅ Guard: already logged in
  if (existingAuth?.token && existingAuth?.user?.email) {
    console.log(
      `✓ Already logged in as ${existingAuth.user.email}\n` +
        `Run \`renard logout\` to switch accounts.`
    );
    return;
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://renard.live");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "POST" && req.url === "/auth/callback") {
      let body = "";

      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body);

          fs.writeFileSync(
            AUTH_FILE,
            JSON.stringify(
              {
                token: data.token,
                user: data.user,
                loggedInAt: new Date().toISOString(),
              },
              null,
              2
            )
          );

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));

          console.log(`\n✓ Logged in as ${data.user.email}\n`);
          server.close();
        } catch (e) {
          res.writeHead(400);
          res.end("Invalid payload");
        }
      });

      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(8787, async () => {
    console.log("🔐 Opening browser for Renard login...");

    const { default: open } = await import("open");
    await open("https://renard.live/extension-login?source=cli&port=8787");
  });
}
