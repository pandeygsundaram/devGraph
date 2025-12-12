console.log("Background worker started");

// Fixed storage key to match popup.js
const STORAGE_KEY = "ai_chat_messages_v1";

// Listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received message:", msg);

  // Ping test
  if (msg.ping === "hello") {
    sendResponse({ ok: true, pong: "pong" });
    return true;
  }

  // Store messages
  if (msg.type === "NEW_MESSAGES") {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      const existing = Array.isArray(res[STORAGE_KEY]) ? res[STORAGE_KEY] : [];

      // Check if this is a duplicate of the last entry
      const lastEntry = existing[existing.length - 1];
      const isDuplicate =
        lastEntry &&
        lastEntry.site === msg.site &&
        JSON.stringify(lastEntry.messages) === JSON.stringify(msg.messages);

      if (!isDuplicate && msg.messages && msg.messages.length > 0) {
        existing.push({
          site: msg.site,
          timestamp: Date.now(),
          messages: msg.messages || [],
        });

        chrome.storage.local.set({ [STORAGE_KEY]: existing }, () => {
          console.log("Messages stored:", existing.length);

          // Notify popup if it's open
          chrome.runtime.sendMessage({ type: "STORAGE_UPDATED" }).catch(() => {
            // Popup might not be open, that's fine
          });
        });
      }
    });

    sendResponse({ ok: true });
    return true;
  }

  // Retrieve messages
  if (msg.type === "GET_STORED") {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      sendResponse({ data: res[STORAGE_KEY] || [] });
    });

    return true; // required for async response
  }

  // Clear messages
  if (msg.type === "CLEAR_STORED") {
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  return false;
});
