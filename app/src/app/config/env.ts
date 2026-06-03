export interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  dataMode: "mock" | "supabase";
  isSupabaseConfigured: boolean;
}

const dataMode = import.meta.env.VITE_APP_DATA_MODE === "mock" ? "mock" : "supabase";

export const appEnv: AppEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  dataMode,
  isSupabaseConfigured: dataMode === "supabase" && Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== "https://your-project.supabase.co" &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== "your-anon-key"
  ),
};
