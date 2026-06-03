import { appEnv } from "../config/env";

let clientPromise: Promise<any> | null = null;

const SUPABASE_REQUEST_TIMEOUT_MS = 10000;

export async function getSupabaseClient() {
  if (!appEnv.isSupabaseConfigured) return null;

  clientPromise ??= createSupabaseClient();
  return clientPromise;
}

async function createSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey, {
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);
        try {
          return await fetch(input, {
            ...init,
            signal: controller.signal,
          });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("Supabase не ответил за 10 секунд. Проверьте сеть, RLS/SQL-запрос или ключ проекта.");
          }
          throw error;
        } finally {
          window.clearTimeout(timeoutId);
        }
      },
    },
  });
}
