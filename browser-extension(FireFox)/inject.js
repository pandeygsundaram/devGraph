// inject.js – runs in the page context (not extension isolated world)
// Captures created shadow roots and keeps a lightweight message index.

(function () {
  if (window.__cc_injected) return;
  window.__cc_injected = true;

  window.__cc_shadows = [];
  window.__cc_messages = []; // {site, role, text, ts}

  const SELECTORS = [
    // ChatGPT
    "[data-message-author-role]",
    ".message-content",

    // Gemini
    "message-content",
    "model-response",
    "user-query",
    ".query-text-container",
    ".model-response-text",

    // Claude
    ".font-claude-message",
    "[data-test-render-count]",
    "div[class*='font-user-message']",
    "div[class*='font-claude-message']",

    // Grok (xAI)
    "[data-testid='conversation-turn']",
    "[data-testid='message-text']",
    ".grok-message",
    ".user-message",
    ".assistant-message",

    // Generic fallbacks
    ".chat-message",
    ".message",
    "[role='listitem']",
    "conv-message",
    "mwc-list-item",
  ];

  function nodeText(el) {
    try {
      return (el.innerText || el.textContent || "").trim();
    } catch (e) {
      return "";
    }
  }

  function guessRole(el) {
    try {
      // Check data attributes
      if (el.dataset && el.dataset.messageAuthorRole)
        return el.dataset.messageAuthorRole;

      // Check explicit attributes
      if (el.getAttribute) {
        const userAttr =
          el.getAttribute("user") === "true" ||
          el.getAttribute("data-user") === "true";
        if (userAttr) return "user";
      }

      // Check class names
      const cn = (el.className || "").toLowerCase();
      if (
        cn.includes("assistant") ||
        cn.includes("bot") ||
        cn.includes("claude") ||
        cn.includes("model")
      )
        return "assistant";
      if (cn.includes("user") || cn.includes("query")) return "user";

      // Check tag names (for Gemini custom elements)
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "model-response" || tag === "message-content")
        return "assistant";
      if (tag === "user-query") return "user";

      // Check parent elements
      const p = el.closest && el.closest("[data-message-author-role]");
      if (p && p.dataset && p.dataset.messageAuthorRole)
        return p.dataset.messageAuthorRole;
    } catch (e) {}
    return "unknown";
  }

  function pushMessage(site, role, text) {
    if (!text || text.length < 2) return; // Skip empty or very short texts
    const last = window.__cc_messages[window.__cc_messages.length - 1];
    if (last && last.text === text && last.role === role && last.site === site)
      return;
    window.__cc_messages.push({
      site: site || location.hostname,
      role,
      text,
      ts: Date.now(),
    });
    if (window.__cc_messages.length > 1000)
      window.__cc_messages.splice(0, window.__cc_messages.length - 1000);
  }

  function scanRootForMessages(root, site) {
    try {
      for (const sel of SELECTORS) {
        const nodes = root.querySelectorAll(sel);
        if (!nodes || !nodes.length) continue;
        nodes.forEach((n) => {
          const text = nodeText(n);
          const role = guessRole(n);
          if (text && text.length > 2) {
            pushMessage(site, role, text);
          }
        });
      }
    } catch (e) {
      console.error("scanRootForMessages error:", e);
    }
  }

  // Find existing shadow roots (for Shadow DOMs created before injection)
  function findExistingShadowRoots(root = document.body) {
    try {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.shadowRoot) {
          window.__cc_shadows.push(node.shadowRoot);
          // Recursively find nested shadow roots
          findExistingShadowRoots(node.shadowRoot);
        }
      }
    } catch (e) {
      console.error("findExistingShadowRoots error:", e);
    }
  }

  // Override attachShadow to capture new shadow roots
  (function overrideAttachShadow() {
    try {
      const orig = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function (init) {
        const shadow = orig.call(this, init);
        try {
          window.__cc_shadows.push(shadow);
        } catch (e) {}
        try {
          const mo = new MutationObserver(() =>
            scanRootForMessages(shadow, location.hostname)
          );
          mo.observe(shadow, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        } catch (e) {}
        setTimeout(() => scanRootForMessages(shadow, location.hostname), 50);
        return shadow;
      };
    } catch (e) {
      console.error("overrideAttachShadow error:", e);
    }
  })();

  // Main document observer
  try {
    const docObserver = new MutationObserver(() => {
      scanRootForMessages(document, location.hostname);
      if (window.__cc_shadows && window.__cc_shadows.length) {
        window.__cc_shadows.forEach((s) => {
          try {
            scanRootForMessages(s, location.hostname);
          } catch (e) {}
        });
      }
    });
    docObserver.observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  } catch (e) {
    console.error("docObserver error:", e);
  }

  // Initial scan with multiple passes to catch late-loading content
  function initialScan() {
    // Find existing shadow roots first
    findExistingShadowRoots();

    // Scan main document
    scanRootForMessages(document, location.hostname);

    // Scan all shadow roots
    if (window.__cc_shadows && window.__cc_shadows.length) {
      window.__cc_shadows.forEach((s) => {
        try {
          scanRootForMessages(s, location.hostname);
        } catch (e) {}
      });
    }
  }

  // Run initial scan multiple times to catch dynamically loaded content
  setTimeout(initialScan, 100);
  setTimeout(initialScan, 500);
  setTimeout(initialScan, 1000);
  setTimeout(initialScan, 2000);

  window.__cc_getMessages = function (opts) {
    opts = opts || {};
    const since = opts.since || 0;
    const site = opts.site || location.hostname;
    return window.__cc_messages
      .filter((m) => m.ts >= since && m.site.includes(site))
      .slice(-500);
  };

  window.__cc_clear = function () {
    window.__cc_messages = [];
  };

  try {
    window.dispatchEvent(new CustomEvent("cc-injected"));
  } catch (e) {}
})();
