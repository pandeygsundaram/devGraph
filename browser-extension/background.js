const STORAGE_KEY = "ai_chat_messages_v1";
const AUTH_KEY = "renard_auth";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AUTH_LOGIN") {
    chrome.tabs.create({
      url: "https://renard.live/extension-login?source=extension",
    });
    return;
  }

  if (msg.type === "AUTH_LOGOUT") {
    chrome.storage.local.remove(AUTH_KEY, notifyAuth);
    return;
  }

  if (msg.type === "AUTH_STATUS") {
    chrome.storage.local.get(AUTH_KEY, (res) => {
      sendResponse({ authenticated: !!res[AUTH_KEY] });
    });
    return true;
  }

  if (msg.type === "NEW_MESSAGES") {
    storeMessages(msg, sendResponse);
    return true;
  }

  if (msg.type === "GET_STORED") {
    chrome.storage.local.get(STORAGE_KEY, (res) => {
      sendResponse({ data: res[STORAGE_KEY] || [] });
    });
    return true;
  }
});

/**
 * ✅ RECEIVE TOKEN FROM WEB APP
 */
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AUTH_SUCCESS" && msg.token) {
    chrome.storage.local.set(
      {
        [AUTH_KEY]: {
          token: msg.token,
          user: msg.user,
          loggedInAt: Date.now(),
        },
      },
      () => {
        notifyAuth();

        // Open extension popup automatically
        chrome.action.openPopup?.();

        sendResponse({ ok: true });
      }
    );
  }

  return true;
});

function notifyAuth() {
  chrome.runtime.sendMessage({
    type: "AUTH_UPDATED",
    authenticated: true,
  });
}

function storeMessages(msg, sendResponse) {
  chrome.storage.local.get(STORAGE_KEY, (res) => {
    const arr = res[STORAGE_KEY] || [];
    arr.push({
      site: msg.site,
      timestamp: Date.now(),
      messages: msg.messages,
    });

    chrome.storage.local.set({ [STORAGE_KEY]: arr }, () => {
      chrome.runtime.sendMessage({ type: "STORAGE_UPDATED" });
      sendResponse({ ok: true });
    });
  });
}
