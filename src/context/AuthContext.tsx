import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isTemporary?: boolean;
  expiresAt?: number; // Timestamp in milliseconds
  deviceId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  generateTemporaryAccess: (email: string, hours?: number) => Promise<string>;
  verifyTemporaryAccess: (token: string) => Promise<boolean>;
}

// Store for temporary tokens (in a real app, this would be in a database)
const temporaryTokens = new Map<string, { 
  email: string; 
  expiresAt: number;
  usedDevices: Set<string>;
}>();

// Generate a random token
const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get device ID (simple implementation - in production use fingerprinting)
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = generateToken();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    
    const parsedUser = JSON.parse(savedUser);
    
    // Check if temporary user has expired
    if (parsedUser.isTemporary && parsedUser.expiresAt) {
      if (Date.now() > parsedUser.expiresAt) {
        // User has expired, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        return null;
      }
    }
    
    return parsedUser;
  });

  // Check for expiration every minute
  useEffect(() => {
    const checkExpiration = setInterval(() => {
      if (user?.isTemporary && user.expiresAt) {
        if (Date.now() > user.expiresAt) {
          logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkExpiration);
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  // Generate a temporary access link
  const generateTemporaryAccess = async (email: string, hours: number = 24): Promise<string> => {
    const token = generateToken();
    const expiresAt = Date.now() + (hours * 60 * 60 * 1000);
    
    temporaryTokens.set(token, {
      email,
      expiresAt,
      usedDevices: new Set()
    });

    return token;
  };

  // Verify and use a temporary access token
  const verifyTemporaryAccess = async (token: string): Promise<boolean> => {
    const tokenData = temporaryTokens.get(token);
    
    if (!tokenData) {
      return false;
    }

    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
      temporaryTokens.delete(token);
      return false;
    }

    const deviceId = getDeviceId();

    // Check if this token has been used on a different device
    if (tokenData.usedDevices.size > 0 && !tokenData.usedDevices.has(deviceId)) {
      // Token already used on another device
      return false;
    }

    // Add current device to used devices
    tokenData.usedDevices.add(deviceId);

    // Create temporary user
    const tempUser: User = {
      id: `temp_${Date.now()}`,
      name: `Guest User`,
      email: tokenData.email,
      isTemporary: true,
      expiresAt: tokenData.expiresAt,
      deviceId: deviceId
    };

    // Log the user in
    login(tempUser);

    // Remove token from store (one-time use)
    temporaryTokens.delete(token);

    return true;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    generateTemporaryAccess,
    verifyTemporaryAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};