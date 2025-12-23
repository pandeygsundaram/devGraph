import React, { useState, useEffect } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const API_URL = import.meta.env.VITE_SERVER;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Redirect if no token is present
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError("");
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    if (!token) {
      setError("Missing reset token. Please request a new link.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: formData.password,
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Reset password error", err);
      let errorMessage = "Failed to reset password. Please try again.";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      quote="Security isn't an afterthought with Renard. The granular access controls and audit logs give us total peace of mind."
      author="Sarah Jenkins"
      role="CISO at TechFlow"
    >
      <div className="flex flex-col space-y-2 text-center">
        {/* Dynamic Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`p-3 rounded-xl ${
              isSuccess ? "bg-green-100 dark:bg-green-900/20" : "bg-primary/10"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <Lock className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isSuccess ? "Password Reset Complete" : "Reset your password"}
        </h1>

        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {isSuccess
            ? "Your password has been successfully updated. You can now log in with your new credentials."
            : "Please enter your new password below."}
        </p>
      </div>

      <div className="grid gap-6 mt-6">
        {!isSuccess ? (
          /* --- Reset Form --- */
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              {/* Error Message Display */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* New Password */}
              <div className="grid gap-2 relative">
                <label
                  className="text-sm font-medium leading-none text-foreground"
                  htmlFor="password"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground pr-10"
                    required
                    disabled={isLoading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading || !token}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium leading-none text-foreground"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  required
                  disabled={isLoading || !token}
                />
              </div>

              <button
                disabled={isLoading || !token}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full mt-2"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </button>
            </div>
          </form>
        ) : (
          /* --- Success State --- */
          <div className="space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full group"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
