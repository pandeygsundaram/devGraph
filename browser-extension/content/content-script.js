// content/content-script.js
(function () {
  const DEBUG = false; // Set to true for debugging

  function log(...args) {
    if (DEBUG) console.log("[Content Script]", ...args);
  }

  // --- Utilities ---
  function debounce(fn, wait = 250) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // inject page script (inject.js) so it runs in page context
  function injectPageScript(fileName) {
    try {
      const s = document.createElement("script");
      s.src = chrome.runtime.getURL(fileName);
      s.onload = () => {
        log("inject.js loaded successfully");
        s.remove();
      };
      s.onerror = (e) => {
        console.error("Failed to load inject.js:", e);
      };
      (document.documentElement || document.head || document.body).appendChild(
        s
      );
    } catch (e) {
      console.error("injectPageScript failed", e);
    }
  }

  // Do injection ASAP
  injectPageScript("inject.js");

  // Helper for packaging messages
  function sendMessagesToBackground(site, messages) {
    if (!messages || messages.length === 0) {
      log("No messages to send");
      return;
    }

    log(`Sending ${messages.length} messages from ${site}`);

    chrome.runtime.sendMessage(
      {
        type: "NEW_MESSAGES",
        site,
        messages,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("sendMessage error:", chrome.runtime.lastError.message);
        } else {
          log("Messages sent successfully", response);
        }
      }
    );
  }

  // safeText - strip excessive whitespace
  const safeText = (s) => {
    if (!s) return "";
    return String(s).trim().replace(/\s+/g, " ");
  };

  // get messages from page-level script
  function readPageMessages() {
    try {
      if (!window.__cc_getMessages) {
        log("__cc_getMessages not available yet");
        return [];
      }

      const msgs = window.__cc_getMessages({ site: location.hostname });
      const result = (msgs || [])
        .map((m) => ({ role: m.role || "unknown", text: safeText(m.text) }))
        .filter((m) => m.text && m.text.length > 2);

      log(`Read ${result.length} messages from page context`);
      return result;
    } catch (e) {
      console.error("readPageMessages error:", e);
      return [];
    }
  }

  // Enhanced fallback scanning with site-specific selectors
  function fallbackScan() {
    const hostname = location.hostname;
    let selectors = [];

    // Site-specific selectors
    if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
      selectors = [
        "[data-message-author-role]",
        ".markdown",
        ".message-content",
      ];
    } else if (hostname.includes("gemini.google.com")) {
      selectors = [
        "message-content",
        "model-response",
        "user-query",
        ".query-text-container",
        ".model-response-text",
      ];
    } else if (hostname.includes("claude.ai")) {
      selectors = [
        ".font-claude-message",
        ".font-user-message",
        "[data-test-render-count]",
        'div[class*="font-claude-message"]',
        'div[class*="font-user-message"]',
      ];
    } else if (hostname.includes("grok.com") || hostname.includes("x.ai")) {
      selectors = [
        '[data-testid="conversation-turn"]',
        '[data-testid="message-text"]',
        ".grok-message",
        ".user-message",
        ".assistant-message",   
      ];
    }
    // Generic fallback selectors
    selectors.push(".message", ".chat-message", '[role="listitem"]');

    const out = [];
    const seen = new Set();

    for (const sel of selectors) {
      try {
        const nodes = document.querySelectorAll(sel);
        log(`Selector "${sel}" found ${nodes.length} nodes`);

        for (const n of nodes) {
          try {
            const text = safeText(n.innerText || n.textContent);
            if (!text || text.length < 3 || seen.has(text)) continue;

            let role = "unknown";

            // Determine role
            if (n.dataset && n.dataset.messageAuthorRole) {
              role = n.dataset.messageAuthorRole;
            } else if (n.tagName) {
              const tag = n.tagName.toLowerCase();
              if (tag === "model-response" || tag === "message-content") {
                role = "assistant";
              } else if (tag === "user-query") {
                role = "user";
              }
            }

            // Check class names
            if (role === "unknown") {
              const cn = (n.className || "").toLowerCase();
              if (
                cn.includes("assistant") ||
                cn.includes("bot") ||
                cn.includes("claude") ||
                cn.includes("model")
              ) {
                role = "assistant";
              } else if (cn.includes("user") || cn.includes("query")) {
                role = "user";
              }
            }

            seen.add(text);
            out.push({ role, text });
          } catch (e) {
            log("Error processing node:", e);
          }
        }
      } catch (e) {
        log(`Error with selector "${sel}":`, e);
      }
    }

    log(`Fallback scan found ${out.length} unique messages`);
    return out;
  }

  // merge page-level messages with fallback scan (page-level preferred)
  let lastSnapshot = "";
  let lastSendTime = 0;
  const MIN_SEND_INTERVAL = 1000; // Don't send more than once per second

  const collectAndSend = debounce(() => {
    try {
      // Throttle sends
      const now = Date.now();
      if (now - lastSendTime < MIN_SEND_INTERVAL) {
        log("Throttling send");
        return;
      }

      const pageMsgs = readPageMessages();
      const fallback = fallbackScan();

      // Merge with preference to page messages
      const combined = [...pageMsgs];
      const pageTexts = new Set(pageMsgs.map((m) => m.text));

      for (const f of fallback) {
        if (!pageTexts.has(f.text)) {
          combined.push(f);
        }
      }

      if (combined.length === 0) {
        log("No messages found");
        return;
      }

      // Create snapshot of recent messages
      const snapshot = JSON.stringify(combined.map((m) => m.text).slice(-100));

      if (snapshot !== lastSnapshot) {
        log(`Sending update with ${combined.length} messages`);
        lastSnapshot = snapshot;
        lastSendTime = now;
        sendMessagesToBackground(location.hostname, combined);
      } else {
        log("No changes detected");
      }
    } catch (err) {
      console.error("collectAndSend error:", err);
    }
  }, 300);

  // Wait for inject.js to initialize
  let initAttempts = 0;
  const maxInitAttempts = 10;

  function waitForInjection() {
    if (window.__cc_injected || initAttempts >= maxInitAttempts) {
      log("Injection detected or max attempts reached, starting collection");
      startCollection();
    } else {
      initAttempts++;
      log(`Waiting for injection, attempt ${initAttempts}`);
      setTimeout(waitForInjection, 100);
    }
  }

  function startCollection() {
    // Initial collection
    setTimeout(collectAndSend, 500);
    setTimeout(collectAndSend, 1500);
    setTimeout(collectAndSend, 3000);

    // Ping background to warm the worker
    chrome.runtime.sendMessage({ ping: "hello" }, (res) => {
      log("Background ping response:", res);
    });

    // Observe DOM changes
    const observer = new MutationObserver(() => {
      collectAndSend();
    });

    try {
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      log("MutationObserver started");
    } catch (e) {
      console.error("Failed to start observer:", e);
    }

    // Poll periodically (helps with virtualized UIs and shadow DOM)
    const poll = setInterval(collectAndSend, 2000);
    log("Polling started");

    // cleanup
    window.addEventListener("beforeunload", () => {
      observer.disconnect();
      clearInterval(poll);
      log("Cleanup completed");
    });
  }

  // Start the initialization wait
  setTimeout(waitForInjection, 100);
})();
