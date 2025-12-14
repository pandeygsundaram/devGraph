import { Route, Routes } from "react-router-dom";
import "./index.css";

// Public Pages
import LoginPage from "./components/auth/login";
import SignupPage from "./components/auth/signup";
import Landing from "./pages/home(401)/landing";

// Auth Helpers
import { ProtectedRoute } from "./components/auth/protectedRoute";

import DashboardPage from "./pages/home/dashboard";
import { PublicRoute } from "./components/auth/publicRoute";
import ExtensionLoginPage from "./components/auth/extension-login";
import ExtensionSignupPage from "./components/auth/extension-signup";
import ExtensionSuccess from "./components/auth/extension-success";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/extension-login" element={<ExtensionLoginPage />} />
      <Route path="/extension-signup" element={<ExtensionSignupPage />} />
      <Route path="/extension-success" element={<ExtensionSuccess />} />

      {/* --- Guest Only Routes (Login/Signup) --- */}
      {/* If logged in, these redirect to /dashboard */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* --- Protected Routes (Dashboard) --- */}
      {/* If NOT logged in, these redirect to /login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
