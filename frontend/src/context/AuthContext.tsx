"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, User, loginUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (formData: FormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      console.log("[Auth] Restoring session...");
      const userData = await getCurrentUser(authToken);
      setUser(userData);
      console.log("[Auth] Session restored for:", userData.email);
    } catch (error) {
      console.error('[Auth] Session restoration failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  // Separate redirect logic that reacts to state changes
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/';
    
    if (user) {
      if (isAuthRoute) {
        console.log("[Auth] Authenticated user on auth route, redirecting to dashboard");
        router.push('/dashboard');
      }
    } else {
      if (!isAuthRoute) {
        console.log("[Auth] Unauthenticated user on protected route, redirecting to login");
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await loginUser(formData);
      const { access_token } = response;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      await fetchUser(access_token);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    console.log("[Auth] Logging out...");
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
