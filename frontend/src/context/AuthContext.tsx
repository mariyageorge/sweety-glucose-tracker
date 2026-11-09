import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authApi, getErrorMessage } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session on page reload using GET /api/auth/me
  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const loggedInUser = await authApi.login(credentials);
      setUser(loggedInUser);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const signup = async (payload: { name: string; email: string; password: string }) => {
    try {
      const registeredUser = await authApi.signup(payload);
      setUser(registeredUser);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

