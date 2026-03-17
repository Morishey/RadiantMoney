import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useRef
} from "react";
import { useNavigate } from "react-router-dom";

/* =========================
   TYPES
========================= */

interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  isTemporary?: boolean;
  expiresAt?: number;
  deviceId?: string;
  sessionId?: string;
  sessionTimeout?: number | null;
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
const LAST_ACTIVITY_KEY = "last_activity";
const SESSION_TIMEOUT_KEY = "session_timeout";

/* =========================
   LOGIN ATTEMPT TRACKING
========================= */

interface LoginAttempt {
  count: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

const LOGIN_ATTEMPTS_KEY = "login_attempts";
const MAX_ATTEMPTS = 3;
const COOLDOWN_HOURS = 24;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

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
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================
     LOGOUT (defined first)
  ========================= */

  const logout = useCallback(() => {
    console.log('Logout called');
    
    // Clear all timers
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (activityCheckIntervalRef.current) {
      clearInterval(activityCheckIntervalRef.current);
      activityCheckIntervalRef.current = null;
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(SESSION_TIMEOUT_KEY);
    
    navigate("/login");
  }, [navigate]);

  /* =========================
     SESSION MANAGEMENT
  ========================= */

  const clearSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  const checkSessionExpiry = useCallback(() => {
    if (!user) return;
    
    if (user.role === 'user' && user.sessionTimeout) {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > user.sessionTimeout) {
          console.log('Session expired due to inactivity');
          logout();
        }
      }
    }
  }, [user, logout]);

  const startSessionTimer = useCallback((timeout: number) => {
    clearSessionTimer();
    
    localStorage.setItem(SESSION_TIMEOUT_KEY, timeout.toString());
    
    sessionTimerRef.current = setTimeout(() => {
      console.log('Session timer expired - logging out');
      logout();
    }, timeout);
  }, [clearSessionTimer, logout]);

  const updateLastActivity = useCallback(() => {
    if (user?.role === 'user') {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      
      if (user.sessionTimeout) {
        clearSessionTimer();
        sessionTimerRef.current = setTimeout(() => {
          console.log('Session expired after inactivity');
          logout();
        }, user.sessionTimeout);
      }
    }
  }, [user, clearSessionTimer, logout]);

  /* =========================
     LOAD STORED DATA
  ========================= */

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Loaded saved user:', parsedUser);
        
        if (parsedUser.isTemporary && parsedUser.expiresAt) {
          if (Date.now() > parsedUser.expiresAt) {
            console.log('Temporary user expired');
            logout();
            setIsLoading(false);
            return;
          }
        }
        
        if (parsedUser.role === 'user' && parsedUser.sessionTimeout) {
          const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
          if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > parsedUser.sessionTimeout) {
              console.log('Session expired - logging out');
              logout();
              setIsLoading(false);
              return;
            }
          }
          
          const remainingTime = parsedUser.sessionTimeout - (Date.now() - parseInt(lastActivity || Date.now().toString()));
          if (remainingTime > 0) {
            startSessionTimer(remainingTime);
          } else {
            logout();
            setIsLoading(false);
            return;
          }
        }
        
        setUser(parsedUser);
        setToken(savedToken);
      } catch (error) {
        console.error('Error loading saved user:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  /* =========================
     ACTIVITY LISTENERS
  ========================= */

  useEffect(() => {
    if (user?.role === 'user' && user.sessionTimeout) {
      const activityEvents = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart'];
      
      const handleActivity = () => {
        updateLastActivity();
      };
      
      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
      
      activityCheckIntervalRef.current = setInterval(() => {
        checkSessionExpiry();
      }, 60000);
      
      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
        if (activityCheckIntervalRef.current) {
          clearInterval(activityCheckIntervalRef.current);
        }
      };
    }
  }, [user, updateLastActivity, checkSessionExpiry]);

  /* =========================
     STORAGE CHANGE LISTENER
  ========================= */

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
        logout();
      }
      if (e.key === LAST_ACTIVITY_KEY) {
        checkSessionExpiry();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout, checkSessionExpiry]);

  /* =========================
     UNAUTHORIZED EVENT LISTENER
  ========================= */

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [logout]);

  /* =========================
     TEMP USER EXPIRY CHECK
  ========================= */

  useEffect(() => {
    const timer = setInterval(() => {
      if (user?.isTemporary && user.expiresAt) {
        if (Date.now() > user.expiresAt) {
          logout();
        }
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [user, logout]);

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }
      if (activityCheckIntervalRef.current) {
        clearInterval(activityCheckIntervalRef.current);
      }
    };
  }, []);

  /* =========================
     LOGIN
  ========================= */

  const login = (userData: User, newToken: string) => {
    console.log('Login called with:', userData, newToken);
    
    const sessionId = generateToken();
    const deviceId = getDeviceId();
    
    let sessionTimeout = null;
    if (userData.role === 'user') {
      sessionTimeout = 60 * 1000;
    }
    
    const userWithSession = {
      ...userData,
      sessionId,
      deviceId,
      sessionTimeout
    };

    localStorage.setItem(GLOBAL_SESSION_KEY, sessionId);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithSession));
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(AUTH_KEY, "true");
    
    if (userData.role === 'user') {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      
      if (sessionTimeout) {
        startSessionTimer(sessionTimeout);
      }
    }

    setUser(userWithSession);
    setToken(newToken);
    
    console.log('User set, isAuthenticated should be true');
  };

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
      role: 'user',
      isTemporary: true,
      expiresAt: tokenData.expiresAt,
      deviceId
    };

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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