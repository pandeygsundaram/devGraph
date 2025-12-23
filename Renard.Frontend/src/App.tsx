import { Route, Routes } from "react-router-dom";
import "./index.css";

// Public Pages
import LoginPage from "./components/auth/login";
import SignupPage from "./components/auth/signup";
import Landing from "./pages/home(401)/landing";

// Auth Helpers
import { ProtectedRoute } from "./components/auth/protectedRoute";

import DashboardPage from "./pages/home/dashboard";
import BrainPage from "./pages/home/brain";
import IntegrationsPage from "./pages/home/integrations";
import SettingsPage from "./pages/home/settings";
import { PublicRoute } from "./components/auth/publicRoute";
import ExtensionLoginPage from "./components/auth/extension-login";
import ExtensionSignupPage from "./components/auth/extension-signup";
import ExtensionSuccess from "./components/auth/extension-success";
import PrivacyPolicy from "./pages/legal/privacy";
import TermsPage from "./pages/legal/terms";
import OAuthCallback from "./components/auth/oauthCallback";
import VerifyEmailPage from "./components/auth/verifyEmail";
import ForgotPasswordPage from "./components/auth/forgotPassword";
import ResetPasswordPage from "./components/auth/resetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/extension-login" element={<ExtensionLoginPage />} />
      <Route path="/extension-signup" element={<ExtensionSignupPage />} />
      <Route path="/extension-success" element={<ExtensionSuccess />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* --- Guest Only Routes (Login/Signup) --- */}
      {/* If logged in, these redirect to /dashboard */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        <Route path="/auth/callback" element={<OAuthCallback />} />
      </Route>

      {/* --- Protected Routes (Dashboard) --- */}
      {/* If NOT logged in, these redirect to /login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/brain" element={<BrainPage />} />
        <Route path="/dashboard/integrations" element={<IntegrationsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
