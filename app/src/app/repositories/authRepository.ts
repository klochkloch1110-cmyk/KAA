import { appEnv } from "../config/env";
import { getSupabaseClient } from "../services/supabaseClient";

export type AppRole = "admin" | "operator" | "driver";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthRepository {
  mode: "mock" | "supabase";
  signIn: (input: SignInInput) => Promise<AuthUser>;
  signInAsMockRole: (role: AppRole) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<AuthUser | null>;
}

const mockUsers: Record<AppRole, AuthUser> = {
  admin: {
    id: "mock-admin",
    email: "admin@avl84.local",
    fullName: "Дмитрий Иванов",
    role: "admin",
  },
  operator: {
    id: "mock-operator",
    email: "operator@avl84.local",
    fullName: "Оператор AVL 84",
    role: "operator",
  },
  driver: {
    id: "mock-driver-1",
    email: "driver1@avl84.local",
    fullName: "Иванов Иван Петрович",
    role: "driver",
  },
};

export const authRepository: AuthRepository = appEnv.isSupabaseConfigured
  ? createSupabaseAuthRepository()
  : createMockAuthRepository();

function createMockAuthRepository(): AuthRepository {
  return {
    mode: "mock",
    async signIn({ email }) {
      const normalized = email.trim().toLowerCase();
      if (normalized.includes("driver")) return mockUsers.driver;
      if (normalized.includes("operator")) return mockUsers.operator;
      return mockUsers.admin;
    },
    async signInAsMockRole(role) {
      return mockUsers[role];
    },
    async signOut() {},
    async getCurrentUser() {
      return null;
    },
  };
}

function createSupabaseAuthRepository(): AuthRepository {
  return {
    mode: "supabase",
    async signIn({ email, password }) {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("Supabase не настроен");

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Supabase не вернул пользователя");

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id,role,full_name,status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw new Error(profileError.message);
      if (!profile) {
        throw new Error("Профиль пользователя не найден в public.users. Проверь seed и UUID auth.users.");
      }
      if (profile.status === "blocked") throw new Error("Пользователь заблокирован");

      return {
        id: data.user.id,
        email: data.user.email ?? email,
        fullName: profile.full_name,
        role: profile.role,
      };
    },
    async signInAsMockRole(role) {
      return mockUsers[role];
    },
    async signOut() {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      await withTimeout(
        supabase.auth.signOut({ scope: "local" }),
        5000,
        "Локальный выход выполнен, но Supabase не подтвердил завершение сессии за 5 секунд."
      );
    },
    async getCurrentUser() {
      const supabase = await getSupabaseClient();
      if (!supabase) return null;

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      if (!sessionUser) return null;

      const { data: profile } = await supabase
        .from("users")
        .select("id,role,full_name,status")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!profile) return null;
      if (profile.status === "blocked") {
        await supabase.auth.signOut({ scope: "local" });
        return null;
      }

      return {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        fullName: profile.full_name,
        role: profile.role,
      };
    },
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}
