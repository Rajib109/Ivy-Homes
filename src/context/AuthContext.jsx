import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, refreshAuthToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load stored session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ivy_auth_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.accessToken) {
          setUser(session.user);
          setAccessToken(session.accessToken);
          setRefreshToken(session.refreshToken);
          setExpiresAt(session.expiresAt);
        }
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved items per logged in user
  useEffect(() => {
    if (user && user.email) {
      try {
        const stored = localStorage.getItem(`ivy_saved_${user.email}`);
        if (stored) {
          setSavedItems(JSON.parse(stored));
        } else {
          setSavedItems([]);
        }
      } catch (e) {
        console.error("Failed to load saved items:", e);
        setSavedItems([]);
      }
    } else {
      setSavedItems([]);
    }
  }, [user]);

  // Persist session changes
  const saveSession = useCallback((userData, token, rToken, expiresInSeconds) => {
    const expirationTime = Date.now() + (expiresInSeconds || 900) * 1000;
    const sessionData = {
      user: userData,
      accessToken: token,
      refreshToken: rToken,
      expiresAt: expirationTime,
    };
    setUser(userData);
    setAccessToken(token);
    setRefreshToken(rToken);
    setExpiresAt(expirationTime);
    localStorage.setItem("ivy_auth_session", JSON.stringify(sessionData));
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      saveSession(data.user, data.access_token, data.refresh_token, data.expires_in);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Manual or automatic refresh handler
  const refreshSession = useCallback(async () => {
    if (!refreshToken) return null;
    setRefreshing(true);
    try {
      const data = await refreshAuthToken(refreshToken);
      saveSession(data.user || user, data.access_token, data.refresh_token || refreshToken, data.expires_in);
      console.log("Session refreshed successfully at", new Date().toLocaleTimeString());
      return data;
    } catch (err) {
      console.error("Refresh token failed:", err);
      // If refresh fails, clear session
      logout();
      throw err;
    } finally {
      setRefreshing(false);
    }
  }, [refreshToken, user, saveSession]);

  // Automatic token refresh scheduler
  useEffect(() => {
    if (!accessToken || !refreshToken || !expiresAt) return;

    const timeUntilExpiry = expiresAt - Date.now();
    // Refresh 2 minutes (120,000ms) before token expires, or immediately if close to expiry
    const refreshLeadTime = 120000;
    const delay = Math.max(5000, timeUntilExpiry - refreshLeadTime);

    console.log(`Token refresh scheduled in ${Math.round(delay / 1000)} seconds.`);

    const timer = setTimeout(() => {
      refreshSession().catch((e) => console.error("Auto refresh background error:", e));
    }, delay);

    return () => clearTimeout(timer);
  }, [accessToken, refreshToken, expiresAt, refreshSession]);

  // Logout handler
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresAt(null);
    localStorage.removeItem("ivy_auth_session");
  };

  // Favourites management per user
  const toggleSaveItem = (item) => {
    if (!user || !user.email) return;
    const itemId = item.listing_id || item.project_id;
    if (!itemId) return;

    let updated;
    const exists = savedItems.some((x) => (x.listing_id || x.project_id) === itemId);
    if (exists) {
      updated = savedItems.filter((x) => (x.listing_id || x.project_id) !== itemId);
    } else {
      updated = [item, ...savedItems];
    }
    setSavedItems(updated);
    localStorage.setItem(`ivy_saved_${user.email}`, JSON.stringify(updated));
  };

  const isItemSaved = (itemId) => {
    if (!itemId) return false;
    return savedItems.some((x) => (x.listing_id || x.project_id) === itemId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        expiresAt,
        loading,
        refreshing,
        savedItems,
        login,
        logout,
        refreshSession,
        toggleSaveItem,
        isItemSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
