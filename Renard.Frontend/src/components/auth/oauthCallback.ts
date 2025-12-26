import axios from "axios";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const completeLogin = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userJson = params.get("user");

        if (!token) {
          throw new Error("No token found in URL");
        }

        // 1. Store Token
        localStorage.setItem("token", token);

        // 2. Parse User Data from URL (Contains authProvider & hasSetPassword)
        let urlUserData = {};
        if (userJson) {
          try {
            urlUserData = JSON.parse(decodeURIComponent(userJson));
          } catch (e) {
            console.error("Failed to parse user from URL", e);
          }
        }

        // 3. Fetch Full Profile (Contains Team & API Key)
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { user: profileUser, apiKey, team } = response.data;

        // 4. Merge Data (Profile data + URL flags)
        // We prioritise URL data for auth flags, and Profile data for Name/Email
        const finalUser = {
          ...profileUser,
          ...urlUserData,
        };

        localStorage.setItem("user", JSON.stringify(finalUser));

        if (apiKey) {
          localStorage.setItem("apiKey", apiKey);
        }

        if (team) {
          localStorage.setItem("team", JSON.stringify(team));
        }

        navigate("/dashboard");
      } catch (error) {
        console.error("OAuth Callback Error:", error);
        localStorage.removeItem("token");
        navigate("/login?error=auth_failed");
      }
    };

    completeLogin();
  }, [navigate]);
}
