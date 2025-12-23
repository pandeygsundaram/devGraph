import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_SERVER;

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      // We always show success even if email doesn't exist (security practice)
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Forgot password error", err);
      let errorMessage = "Something went wrong. Please try again.";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors[0].msg;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      quote="The automated daily summaries allow me to focus on coding instead of writing status reports. It's a game changer."
      author="James Kim"
      role="VP of Engineering at Nexus"
    >
      <div className="flex flex-col space-y-2 text-center">
        {/* Dynamic Header based on state */}
        <div className="flex justify-center mb-4">
          <div
            className={`p-3 rounded-xl ${
              isSubmitted
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-primary/10"
            }`}
          >
            {isSubmitted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Mail className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isSubmitted ? "Check your email" : "Forgot your password?"}
        </h1>

        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {isSubmitted
            ? `We have sent a password reset link to ${email} if it exists in our system.`
            : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      <div className="grid gap-6 mt-6">
        {!isSubmitted ? (
          /* --- Form State --- */
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <label
                  className="text-sm font-medium leading-none text-foreground"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  required
                />
              </div>

              <button
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
            </div>
          </form>
        ) : (
          /* --- Success State --- */
          <div className="space-y-4">
            <div className="text-sm text-center text-muted-foreground bg-secondary/50 p-4 rounded-lg border border-border">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setError("");
                }}
                className="text-primary hover:underline font-medium"
              >
                try another email address
              </button>
              .
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Back to Login Link (Only show in Form State) */}
        {!isSubmitted && (
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
