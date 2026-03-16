import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback
} from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   TYPES
========================= */

interface User {
  id: string;
  name: string;
  email: string;
  isTemporary?: boolean;
  expiresAt?: number;
  deviceId?: string;
  sessionId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  generateTemporaryAccess: (email: string, hours?: number) => Promise<string>;
  verifyTemporaryAccess: (token: string) => Promise<boolean>;
}

/* =========================
   STORAGE KEYS
========================= */

const USER_KEY = "user";
const TOKEN_KEY = "token";
const AUTH_KEY = "isAuthenticated";
const GLOBAL_SESSION_KEY = "crest_global_session";
const DEVICE_KEY = "device_id";

/* =========================
   TEMP TOKEN STORE
========================= */

const temporaryTokens = new Map<
  string,
  {
    email: string;
    expiresAt: number;
    usedDevices: Set<string>;
  }
>();

/* =========================
   HELPERS
========================= */

const generateToken = (): string => {
  return (
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)
  );
};

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = generateToken();
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
};

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   PROVIDER
========================= */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      // Check temporary expiration
      if (parsedUser.isTemporary && parsedUser.expiresAt) {
        if (Date.now() > parsedUser.expiresAt) {
          logout();
          setIsLoading(false);
          return;
        }
      }
      setUser(parsedUser);
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  // Validate token with backend on startup (optional)
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !user) return;
      try {
        const response = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Token invalid");
        const userData = await response.json();
        // Optionally update user data
      } catch {
        logout();
      }
    };
    validateToken();
  }, []);

  // Listen for changes in localStorage (other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GLOBAL_SESSION_KEY) {
        const currentSession = localStorage.getItem(GLOBAL_SESSION_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.sessionId !== currentSession) {
            logout();
          }
        }
      }
      if (e.key === TOKEN_KEY && !e.newValue) {
        logout(); // token was removed in another tab
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Listen for "unauthorized" event from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  // Auto logout for temporary users
  useEffect(() => {
    const timer = setInterval(() => {
      if (user?.isTemporary && user.expiresAt) {
        if (Date.now() > user.expiresAt) {
          logout();
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [user]);

  /* =========================
     LOGIN
  ========================= */

  const login = (userData: User, newToken: string) => {
    const sessionId = generateToken(); // new session ID for this login
    const userWithSession = {
      ...userData,
      sessionId,
      deviceId: getDeviceId()
    };

    localStorage.setItem(GLOBAL_SESSION_KEY, sessionId);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithSession));
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(AUTH_KEY, "true");

    setUser(userWithSession);
    setToken(newToken);
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
    navigate("/login");
  }, [navigate]);

  /* =========================
     TEMP ACCESS LINK
  ========================= */

  const generateTemporaryAccess = async (
    email: string,
    hours: number = 24
  ): Promise<string> => {
    const token = generateToken();
    const expiresAt = Date.now() + hours * 60 * 60 * 1000;
    temporaryTokens.set(token, {
      email,
      expiresAt,
      usedDevices: new Set()
    });
    return token;
  };

  const verifyTemporaryAccess = async (
    token: string
  ): Promise<boolean> => {
    const tokenData = temporaryTokens.get(token);
    if (!tokenData) return false;
    if (Date.now() > tokenData.expiresAt) {
      temporaryTokens.delete(token);
      return false;
    }

    const deviceId = getDeviceId();
    if (
      tokenData.usedDevices.size > 0 &&
      !tokenData.usedDevices.has(deviceId)
    ) {
      return false;
    }
    tokenData.usedDevices.add(deviceId);

    const tempUser: User = {
      id: `temp_${Date.now()}`,
      name: "Guest User",
      email: tokenData.email,
      isTemporary: true,
      expiresAt: tokenData.expiresAt,
      deviceId
    };

    // Generate a dummy token for the temporary session
    const tempToken = generateToken();
    login(tempUser, tempToken);

    temporaryTokens.delete(token);
    return true;
  };

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    generateTemporaryAccess,
    verifyTemporaryAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* =========================
   HOOK
========================= */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};