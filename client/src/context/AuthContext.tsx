import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuthUser,
  LoginResponse,
  login as apiLogin,
  logout as apiLogout,
  fetchCurrentUser,
  changePassword as apiChangePassword,
  getStoredToken,
  USER_STORAGE_KEY,
} from "../api.js";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()));
  const [error, setError] = useState<string | null>(null);

  const initAuth = async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setToken(storedToken);
    } catch {
      // If token expired or invalid, clear state
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setError(null);
    const res: LoginResponse = await apiLogin(email, password);
    setUser(res.user);
    if (res.token) {
      setToken(res.token);
    }
    return res.user;
  };

  const logout = async () => {
    setError(null);
    await apiLogout();
    setUser(null);
    setToken(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setError(null);
    const res = await apiChangePassword(currentPassword, newPassword);
    setUser(res.user);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
