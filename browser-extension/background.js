const STORAGE_KEY = "ai_chat_messages_v1";
const AUTH_KEY = "renard_auth";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AUTH_LOGIN") {
    startLogin();
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

function startLogin() {
  chrome.tabs.create({
    url: "https://auth.renard.ai/extension-login",
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.onMessageExternal.addListener((msg) => {
    if (msg.type === "AUTH_SUCCESS") {
      chrome.storage.local.set({ [AUTH_KEY]: msg.token }, notifyAuth);
    }
  });
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
