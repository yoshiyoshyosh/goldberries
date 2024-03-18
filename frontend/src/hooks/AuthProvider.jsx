import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "./useStorage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { APP_URL, DISCORD_AUTH_URL, getOAuthUrl as getDiscordAuthUrl } from "../util/constants";
import { get, set } from "react-hook-form";
import { getErrorMessage } from "../components/BasicComponents";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  const loginWithEmail = async (email, password, redirect) => {
    const data = new FormData();
    data.append("email", email);
    data.append("password", password);
    try {
      const response = await axios.post("/auth/login.php", data);
      const user = await response.data;
      setUser(user);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loginWithDiscord = (url) => {
    let redirect = url ? encodeURIComponent("/" + url) : "";
    let postOAuthLogin = APP_URL + "/post-oauth" + redirect;
    window.location.href = DISCORD_AUTH_URL + "?login=true&redirect=" + postOAuthLogin;
  };

  const registerWithDiscord = () => {
    window.location.href = DISCORD_AUTH_URL;
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout.php");
      setUser(null);
      toast.success("Logged out successfully.");
    } catch (err) {
      if (err.response.status === 401) {
        // Reachable, but wasn't logged in
        setUser(null);
        toast.error("You weren't logged in.");
      } else {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get("/auth/check_session.php");
      const user = await response.data;
      setUser(user);
    } catch (err) {
      if (err.response.status === 401) {
        // Unauthorized, but check succeeded
        setUser(null);
      } else {
        console.log("Failed session check", err);
      }
    }
  };

  // Call once per page load
  useEffect(() => {
    checkSession();
  }, []);

  const isLoggedIn = user !== null;
  const isVerifier = user !== null && user.is_verifier === true;
  const isAdmin = user !== null && user.is_admin === true;
  const hasVerifierPriv = isVerifier || isAdmin;
  const hasPlayerClaimed = user !== null && user.player_id !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isVerifier,
        isAdmin,
        hasVerifierPriv,
        hasPlayerClaimed,
        loginWithEmail,
        loginWithDiscord,
        registerWithDiscord,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
