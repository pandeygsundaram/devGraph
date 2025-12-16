// content/login-bridge.js
console.log(
  "[Renard] Login bridge content script loaded on",
  window.location.href
);

// Listen for messages from the web page
window.addEventListener("message", (event) => {
  // Only accept messages from the same origin
  if (event.origin !== window.location.origin) {
    console.log(
      "[Renard Bridge] Ignoring message from different origin:",
      event.origin
    );
    return;
  }

  console.log("[Renard Bridge] Received message:", event.data);

  if (event.data.type === "RENARD_AUTH_REQUEST") {
    console.log("[Renard Bridge] Forwarding auth to background script");

    // Forward to background script
    browser.runtime
      .sendMessage({
        type: "AUTH_SUCCESS",
        token: event.data.token,
        apiKey: event.data.apiKey,
        user: event.data.user,
        team: event.data.team,
      })
      .then((response) => {
        console.log("[Renard Bridge] Auth successful, notifying page");
        // Notify the web page that auth succeeded
        window.postMessage({ type: "RENARD_AUTH_SUCCESS" }, "*");
      })
      .catch((err) => {
        console.error("[Renard Bridge] Auth failed:", err);
        window.postMessage(
          {
            type: "RENARD_AUTH_ERROR",
            error: err.message,
          },
          "*"
        );
      });
  }
});

// Let the page know the extension is present
console.log("[Renard Bridge] Announcing extension presence");
window.postMessage({ type: "RENARD_EXTENSION_READY" }, "*");
