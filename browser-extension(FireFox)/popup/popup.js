const STORAGE_KEY = "ai_chat_messages_v1";

const listEl = document.getElementById("list");
const statusEl = document.getElementById("authStatus");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");

document.getElementById("refresh").onclick = load;
document.getElementById("clear").onclick = clearStored;

loginBtn.onclick = () => chrome.runtime.sendMessage({ type: "AUTH_LOGIN" });

logoutBtn.onclick = () => chrome.runtime.sendMessage({ type: "AUTH_LOGOUT" });

chrome.runtime.sendMessage({ type: "AUTH_STATUS" }, updateAuthUI);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "AUTH_UPDATED") updateAuthUI(msg);
  if (msg.type === "STORAGE_UPDATED") load();
});

function updateAuthUI(resp) {
  if (resp?.authenticated) {
    statusEl.textContent = "Logged in";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    statusEl.textContent = "Not logged in";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

function load() {
  chrome.runtime.sendMessage({ type: "GET_STORED" }, (resp) => {
    render(resp?.data || []);
  });
}

function clearStored() {
  chrome.storage.local.set({ [STORAGE_KEY]: [] }, load);
}

function render(entries) {
  listEl.innerHTML = "";
  if (!entries.length) {
    listEl.textContent = "No messages captured yet.";
    return;
  }

  for (const e of entries.slice().reverse()) {
    const div = document.createElement("div");
    div.innerHTML = `<b>${e.site}</b> — ${new Date(
      e.timestamp
    ).toLocaleString()}`;
    for (const m of e.messages.slice().reverse()) {
      const p = document.createElement("div");
      p.textContent = `[${m.role}] ${m.text}`;
      div.appendChild(p);
    }
    listEl.appendChild(div);
  }
}

load();
