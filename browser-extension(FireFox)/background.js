/* =====================
   CONSTANTS
===================== */

const STORAGE_KEY = "ai_chat_messages_v1";
const AUTH_KEY = "renard_auth";

const API_BASE = "https://api.renard.live/api";
const FLUSH_INTERVAL = 1 * 60 * 1000; // 2 minutes
const CHUNK_SIZE = 50; // 🔒 SAFE batch size

console.log("[Renard] Background worker started");

/* =====================
   MESSAGE HANDLING
===================== */

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AUTH_LOGIN") {
    browser.tabs
      .create({
        url: "https://renard.live/extension-login?source=extension",
      })
      .then((tab) => {
        // Inject the bridge script after tab opens
        setTimeout(() => {
          browser.tabs
            .executeScript(tab.id, {
              code: `
            console.log("[Renard] Bridge injected");
            window.addEventListener("message", (event) => {
              if (event.data.type === "RENARD_AUTH_REQUEST") {
                console.log("[Renard Bridge] Got auth request, forwarding...");
                browser.runtime.sendMessage({
                  type: "AUTH_SUCCESS",
                  token: event.data.token,
                  apiKey: event.data.apiKey,
                  user: event.data.user,
                  team: event.data.team,
                }).then(() => {
                  console.log("[Renard Bridge] Message sent successfully");
                  window.postMessage({ type: "RENARD_AUTH_SUCCESS" }, "*");
                }).catch((err) => {
                  console.error("[Renard Bridge] Error sending message:", err);
                  window.postMessage({ type: "RENARD_AUTH_ERROR", error: err.message }, "*");
                });
              }
            });
            window.postMessage({ type: "RENARD_EXTENSION_READY" }, "*");
          `,
            })
            .catch((err) =>
              console.error("[Renard] Failed to inject bridge:", err)
            );
        }, 500);
      });
    return;
  }

  if (msg.type === "AUTH_LOGOUT") {
    browser.storage.local.remove(AUTH_KEY, notifyAuth);
    return;
  }

  if (msg.type === "AUTH_STATUS") {
    browser.storage.local.get(AUTH_KEY, (res) => {
      sendResponse({ authenticated: !!res[AUTH_KEY] });
    });
    return true;
  }

  // 🔥 CRITICAL: Handle AUTH_SUCCESS from injected script
  if (msg.type === "AUTH_SUCCESS" && msg.token && msg.team?.id) {
    console.log("[Renard] Received AUTH_SUCCESS, storing...", msg.team.id);
    browser.storage.local.set(
      {
        [AUTH_KEY]: {
          token: msg.token,
          apiKey: msg.apiKey,
          user: msg.user,
          team: msg.team,
          loggedInAt: Date.now(),
        },
      },
      () => {
        console.log("[Renard] Auth stored successfully for team:", msg.team.id);
        notifyAuth();
        sendResponse({ ok: true });
      }
    );
    return true; // Keep channel open for async response
  }

  if (msg.type === "NEW_MESSAGES") {
    storeMessages(msg, sendResponse);
    return true;
  }

  if (msg.type === "GET_STORED") {
    browser.storage.local.get(STORAGE_KEY, (res) => {
      sendResponse({ data: res[STORAGE_KEY] || [] });
    });
    return true;
  }
});

/* =====================
   AUTH HANDSHAKE (External - for Chrome compatibility)
===================== */

browser.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AUTH_SUCCESS" && msg.token && msg.team?.id) {
    console.log(
      "[Renard] Received AUTH_SUCCESS externally, storing...",
      msg.team.id
    );
    browser.storage.local.set(
      {
        [AUTH_KEY]: {
          token: msg.token,
          apiKey: msg.apiKey,
          user: msg.user,
          team: msg.team,
          loggedInAt: Date.now(),
        },
      },
      () => {
        console.log("[Renard] Auth stored for team:", msg.team.id);
        notifyAuth();
        browser.action.openPopup?.();
        sendResponse({ ok: true });
      }
    );
  }

  return true;
});

function notifyAuth() {
  browser.storage.local.get(AUTH_KEY, (res) => {
    browser.runtime.sendMessage({
      type: "AUTH_UPDATED",
      authenticated: !!res[AUTH_KEY],
    });
  });
}

/* =====================
   STORAGE
===================== */

function storeMessages(msg, sendResponse) {
  browser.storage.local.get(STORAGE_KEY, (res) => {
    const arr = res[STORAGE_KEY] || [];

    arr.push({
      site: msg.site,
      timestamp: Date.now(),
      messages: msg.messages,
    });

    browser.storage.local.set({ [STORAGE_KEY]: arr }, () => {
      browser.runtime.sendMessage({ type: "STORAGE_UPDATED" }).catch(() => {});
      sendResponse({ ok: true });
    });
  });
}

/* =====================
   FLUSH PIPELINE
===================== */

async function flushToServer() {
  browser.storage.local.get([STORAGE_KEY, AUTH_KEY], async (res) => {
    const auth = res[AUTH_KEY];
    const entries = res[STORAGE_KEY] || [];

    if (!auth?.token || !auth?.team?.id) {
      console.log("[Renard] Not authenticated, skipping flush");
      return;
    }

    if (entries.length === 0) return;

    /* ---- Transform extension data → backend schema ---- */

    const messages = [];

    for (const entry of entries) {
      for (const m of entry.messages) {
        messages.push({
          activityType: "chat",
          teamId: auth.team.id,
          content: m.text,
          metadata: {
            source: "browser-extension",
            site: entry.site,
            role: m.role,
            capturedAt: entry.timestamp,
          },
        });
      }
    }

    if (messages.length === 0) return;

    console.log(`[Renard] Flushing ${messages.length} messages`);

    try {
      /* ---- Upload in CHUNKS ---- */

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
          throw new Error(`HTTP ${res.status}`);
        }

        console.log(
          `[Renard] Uploaded chunk ${i / CHUNK_SIZE + 1} (${chunk.length})`
        );
      }

      /* ---- Clear buffer ONLY after full success ---- */

      browser.storage.local.set({ [STORAGE_KEY]: [] }, () => {
        console.log("[Renard] Flush successful, buffer cleared");
        browser.runtime
          .sendMessage({ type: "STORAGE_UPDATED" })
          .catch(() => {});
      });
    } catch (err) {
      console.error("[Renard] Flush failed, will retry", err);
    }
  });
}

/* =====================
   SCHEDULER
===================== */

setInterval(flushToServer, FLUSH_INTERVAL);

// Flush once on startup
flushToServer();
