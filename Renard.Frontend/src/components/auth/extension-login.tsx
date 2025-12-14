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
  const port = searchParams.get("port"); // CLI callback port
  const isCLI = source === "cli";

  const API_URL = import.meta.env.VITE_SERVER;
  const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // CLI AUTH FLOW
      if (isCLI && port) {
        try {
          await fetch(`https://renard.live:${port}/auth/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, user }),
          });

          navigate("/extension-success");

          setTimeout(() => {
            window.close();
          }, 2000);
        } catch (e) {
          console.error("Failed to send auth to CLI", e);
          setError("Failed to complete CLI authentication");
        }

        return;
      }

      /**
       * ─────────────────────────────
       * 2️⃣ EXTENSION AUTH FLOW
       * ─────────────────────────────
       */
      if (window.chrome?.runtime?.sendMessage && EXTENSION_ID) {
        window.chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: "AUTH_SUCCESS",
            token,
            user,
          },
          () => {
            setSuccess(true);

            setTimeout(() => {
              window.close();
            }, 2000);
          }
        );

        return;
      }

      /**
       * ─────────────────────────────
       * 3️⃣ NORMAL WEB LOGIN
       * ─────────────────────────────
       */
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * ─────────────────────────────
   * SUCCESS UI
   * ─────────────────────────────
   */
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

  /**
   * ─────────────────────────────
   * LOGIN FORM
   * ─────────────────────────────
   */
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
        {/* Context Indicator */}
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

        {/* Email */}
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

        {/* Password */}
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

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">New to Renard? </span>
        <a
          href={`/extension-signup?source=${source || "extension"}`}
          className="text-primary font-medium hover:underline"
        >
          Create account
        </a>
      </div>
    </ExtensionLayout>
  );
}
