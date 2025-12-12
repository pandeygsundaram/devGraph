// popup/popup.js
const STORAGE_KEY = "ai_chat_messages_v1";
const listEl = document.getElementById("list");
document.getElementById("refresh").addEventListener("click", load);
document.getElementById("clear").addEventListener("click", clearStored);

function render(entries) {
  listEl.innerHTML = "";
  if (!entries.length) {
    listEl.innerHTML = "<div>No messages captured yet.</div>";
    return;
  }
  // latest first
  const arr = entries.slice().reverse();
  for (const e of arr) {
    const d = new Date(e.timestamp);
    const container = document.createElement("div");
    container.className = "entry";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerText = `${e.site} — ${d.toLocaleString()}`;
    container.appendChild(meta);
    for (const m of e.messages.slice().reverse()) {
      const r = document.createElement("div");
      r.innerHTML = `<span class="role">[${
        m.role
      }]</span><span class="text">${escapeHtml(m.text)}</span>`;
      container.appendChild(r);
    }
    listEl.appendChild(container);
  }
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"'`]/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;",
      }[c])
  );
}

function load() {
  chrome.runtime.sendMessage({ type: "GET_STORED" }, (resp) => {
    const data = (resp && resp.data) || [];
    render(data);
  });
}

function clearStored() {
  const obj = {};
  obj[STORAGE_KEY] = [];
  chrome.storage.local.set(obj, () => load());
}

// initial load
load();

// listen for updates while popup is open
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "STORAGE_UPDATED") {
    load();
  }
});
