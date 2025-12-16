import React, { useState } from "react";
import { ExtensionLayout } from "@/components/auth/extension-layout";
import { Loader2, Terminal, Globe, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ExtensionLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const source = searchParams.get("source"); // cli | extension | null
  const port = searchParams.get("port");
  const isCLI = source === "cli";

  const API_URL = import.meta.env.VITE_SERVER;
  const EXTENSION_ID_CHROME = import.meta.env.VITE_CHROME_EXTENSION_ID;
  const EXTENSION_ID_FIREFOX = import.meta.env.VITE_FIREFOX_EXTENSION_ID;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, apiKey, user, team } = data;

      if (!token || !team?.id) {
        throw new Error("Invalid auth payload");
      }

      /* ───────────── CLI AUTH ───────────── */
      if (isCLI && port) {
        await fetch(`http://localhost:${port}/auth/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, apiKey, user, team }),
        });

        navigate("/extension-success");
        setTimeout(() => window.close(), 2000);
        return;
      }

      /* ───────────── EXTENSION AUTH ───────────── */

      if (source === "extension") {
        // Detect browser by user agent (simplest and most reliable)
        const isFirefox = navigator.userAgent.includes("Firefox");
        const isChrome = !isFirefox && navigator.userAgent.includes("Chrome");

        console.log("Browser detection:", {
          isFirefox,
          isChrome,
          userAgent: navigator.userAgent,
        });

        let extensionSuccess = false;

        try {
          if (isFirefox) {
            console.log("Using Firefox postMessage auth...");

            // Wait for extension response via postMessage
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(
                  new Error(
                    "Extension did not respond. Make sure it's installed and enabled."
                  )
                );
              }, 5000);

              const handler = (event: MessageEvent) => {
                if (event.data.type === "RENARD_AUTH_SUCCESS") {
                  clearTimeout(timeout);
                  window.removeEventListener("message", handler);
                  console.log("Firefox auth successful via postMessage");
                  resolve(true);
                } else if (event.data.type === "RENARD_AUTH_ERROR") {
                  clearTimeout(timeout);
                  window.removeEventListener("message", handler);
                  reject(
                    new Error(event.data.error || "Extension auth failed")
                  );
                }
              };

              window.addEventListener("message", handler);

              // Send auth data to content script via postMessage
              console.log("Posting message to window...");
              window.postMessage(
                {
                  type: "RENARD_AUTH_REQUEST",
                  token,
                  apiKey,
                  user,
                  team,
                },
                "*"
              );
            });

            extensionSuccess = true;
          } else if (isChrome) {
            console.log("Using Chrome extension auth...");

            // Check if chrome.runtime is available
            if (!window.chrome?.runtime) {
              throw new Error("Chrome extension API not available");
            }

            if (!EXTENSION_ID_CHROME) {
              throw new Error("Chrome extension ID not configured");
            }

            const chromeRuntime = window.chrome.runtime; // Type guard

            await new Promise((resolve, reject) => {
              chromeRuntime.sendMessage(
                EXTENSION_ID_CHROME,
                {
                  type: "AUTH_SUCCESS",
                  token,
                  apiKey,
                  user,
                  team,
                },
                (response: any) => {
                  if (chromeRuntime.lastError) {
                    reject(new Error(chromeRuntime.lastError.message));
                  } else {
                    console.log("Chrome auth successful");
                    resolve(response);
                  }
                }
              );
            });

            extensionSuccess = true;
          } else {
            throw new Error("Unsupported browser");
          }

          if (extensionSuccess) {
            setSuccess(true);
            setTimeout(() => window.close(), 2000);
            return;
          }
        } catch (err: any) {
          console.error("Extension auth failed:", err);
          setError(
            `Failed to connect to ${
              isFirefox ? "Firefox" : "Chrome"
            } extension. ${
              err.message || "Make sure the extension is installed and enabled."
            }`
          );
          setIsLoading(false);
          return;
        }
      }

      /* ───────────── WEB LOGIN FALLBACK ───────────── */
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }
  if (success) {
    return (
      <ExtensionLayout
        title="Authorized"
        subtitle="You can safely close this window"
      >
        <div className="flex flex-col items-center gap-4 py-10">
          <CheckCircle className="w-10 h-10 text-green-500" />
          <p className="text-sm text-muted-foreground">
            Authentication successful
          </p>
        </div>
      </ExtensionLayout>
    );
  }

  return (
    <ExtensionLayout
      title={isCLI ? "Authorize Renard CLI" : "Connect Renard Extension"}
      subtitle={
        isCLI
          ? "Grant terminal activity access"
          : "Sync browser conversations with Renard"
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border">
          <div className="p-2 bg-background rounded-md border">
            {isCLI ? (
              <Terminal className="w-4 h-4" />
            ) : (
              <Globe className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <div className="text-sm">
            <p className="font-medium">
              {isCLI ? "Renard CLI" : "Chrome Extension"}
            </p>
            <p className="text-xs text-muted-foreground">
              Requesting write access
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-9 px-3 rounded-md border"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-9 px-3 rounded-md border"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          disabled={isLoading}
          className="w-full h-9 bg-primary text-white rounded-md flex items-center justify-center"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Authorize
        </button>
      </form>
    </ExtensionLayout>
  );
}
