import React, { useState, useRef, useEffect } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_SERVER;

  // Retrieve email from navigation state or fallback (handle page refresh edge case)
  const email = location.state?.email;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));

  // Timer state for Resend OTP (30 seconds)
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Initialize ref array correctly
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to login if no email is found (e.g., direct access via URL)
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // Handle Countdown Timer
  useEffect(() => {
    // FIX 1: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout
    let interval: ReturnType<typeof setInterval>;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle Verify Submission
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const fullCode = otp.join("");

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp: fullCode,
      });

      const { token, user, apiKey, team } = response.data;

      // Store session data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (apiKey) {
        localStorage.setItem("apiKey", apiKey);
      }
      if (team) {
        localStorage.setItem("team", JSON.stringify(team));
      }

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Verification error", err);
      let errorMessage = "Verification failed. Please check the code.";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Resend OTP
  async function handleResend() {
    if (!canResend) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post(`${API_URL}/auth/resend-otp`, { email });

      // Reset timer
      setTimer(30);
      setCanResend(false);
      setSuccessMessage("A new code has been sent to your email.");
    } catch (err: any) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      quote="The semantic search feature is like having a conversation with my past self. It saves me hours of context switching."
      author="David Chen"
      role="Senior Dev at Stripe"
    >
      <div className="flex flex-col items-center space-y-6 text-center">
        {/* Icon */}
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Enter Verification Code
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {email || "your email"}
            </span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="w-full max-w-xs space-y-6">
          {/* Error / Success Messages */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {successMessage}
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                // FIX 2: Use curly braces {} to return void
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={data}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-10 h-12 text-center text-lg font-semibold border border-input bg-background rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
              />
            ))}
          </div>

          <button
            disabled={isLoading || otp.some((digit) => digit === "")}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Account
          </button>
        </form>

        <div className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              type="button" // Add type button to prevent form submission
              disabled={!canResend || isLoading}
              className={`font-medium hover:underline transition-colors ${
                !canResend
                  ? "text-muted-foreground cursor-not-allowed no-underline"
                  : "text-primary"
              }`}
            >
              {canResend ? "Resend Code" : `Resend Code in ${timer}s`}
            </button>
          </p>

          <button
            onClick={() => navigate("/login")}
            type="button" // Add type button
            className="flex items-center justify-center gap-2 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
