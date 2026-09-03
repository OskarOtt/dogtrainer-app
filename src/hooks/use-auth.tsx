import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { authApi } from '@/api/auth';
import { registerRefreshHandler } from '@/api/client';
import type { LoginPayload, RegisterPayload, User } from '@/types/auth';
import { tokenStorage } from '@/utils/tokenStorage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const clearSession = useCallback(async () => {
    await tokenStorage.clearTokens();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    // Lets the shared axios client silently refresh an expired access token using the
    // stored refresh token, without every screen/hook needing to know about tokens.
    registerRefreshHandler(async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }
      try {
        const tokens = await authApi.refresh(refreshToken);
        await tokenStorage.setTokens(tokens);
        return tokens.accessToken;
      } catch {
        await clearSession();
        return null;
      }
    });
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      const tokens = await tokenStorage.getTokens();
      if (!tokens) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload);
    await tokenStorage.setTokens(tokens);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const tokens = await authApi.register(payload);
    await tokenStorage.setTokens(tokens);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort — still clear the local session even if the server call fails
      }
    }
    await clearSession();
    router.replace('/(auth)/login');
  }, [clearSession, router]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
