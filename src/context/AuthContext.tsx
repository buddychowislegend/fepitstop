"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  profile?: 'frontend' | 'product' | 'business' | 'qa' | 'hr' | 'backend';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, profile?: User['profile']) => Promise<void>;
  googleLogin: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { api } from "@/lib/config";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("fp_token") || localStorage.getItem("token");
    const storedUser = localStorage.getItem("fp_user") || localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, name: string, profile?: User['profile']) => {
    const res = await fetch(api(`/auth/signup`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, profile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("fp_token", data.token);
    localStorage.setItem("fp_user", JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(api(`/auth/signin`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("fp_token", data.token);
    localStorage.setItem("fp_user", JSON.stringify(data.user));
  };

  const googleLogin = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("fp_token", token);
    localStorage.setItem("fp_user", JSON.stringify(userData));
    // Also store with the keys that might be used elsewhere
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fp_token");
    localStorage.removeItem("fp_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, googleLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

