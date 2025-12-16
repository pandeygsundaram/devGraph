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
    browser.tabs.create({
      url: "https://renard.live/extension-login?source=extension",
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
   AUTH HANDSHAKE
===================== */

browser.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AUTH_SUCCESS" && msg.token && msg.team?.id) {
    browser.storage.local.set(
      {
        [AUTH_KEY]: {
          token: msg.token,
          apiKey: msg.apiKey, // optional, not used for fetch
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
  browser.runtime.sendMessage({
    type: "AUTH_UPDATED",
    authenticated: true,
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
      browser.runtime.sendMessage({ type: "STORAGE_UPDATED" });
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
        browser.runtime.sendMessage({ type: "STORAGE_UPDATED" });
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
