import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authRepository } from "../repositories/authRepository";
import type { AppRole, AuthUser, SignInInput } from "../repositories/authRepository";

interface AuthContextValue {
  authMode: "mock" | "supabase";
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (input: SignInInput) => Promise<void>;
  signInAsMockRole: (role: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authRepository.getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Не удалось проверить сессию");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    authMode: authRepository.mode,
    user,
    isLoading,
    error,
    async signIn(input) {
      setIsLoading(true);
      setError(null);
      try {
        setUser(await authRepository.signIn(input));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось войти");
      } finally {
        setIsLoading(false);
      }
    },
    async signInAsMockRole(role) {
      setIsLoading(true);
      setError(null);
      try {
        setUser(await authRepository.signInAsMockRole(role));
      } finally {
        setIsLoading(false);
      }
    },
    async signOut() {
      setError(null);
      setUser(null);
      try {
        await authRepository.signOut();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось выйти из Supabase");
      }
    },
  }), [error, isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
