import { useState } from "react";
import { Lock, Mail, UserCog } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function LoginScreen() {
  const { authMode, error, isLoading, signIn, signInAsMockRole } = useAuth();
  const [email, setEmail] = useState("admin@avl84.local");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    if (!email.trim()) {
      setLocalError("Укажите email для входа.");
      return;
    }
    if (authMode === "supabase" && !password) {
      setLocalError("Укажите пароль Supabase.");
      return;
    }
    await signIn({ email, password });
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(42,133,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,230,118,0.08),transparent_30%)]" />
      <div className="relative w-full max-w-md">
        <form onSubmit={handleSubmit} className="rounded-3xl p-6 md:p-8 border border-border bg-[#111521]/95 backdrop-blur-xl shadow-2xl">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_24px_rgba(42,133,255,0.25)]">
              <span className="text-primary font-black text-xl">А</span>
            </div>
            <div>
              <p className="text-xl font-black tracking-wide">АВЛ 84</p>
              <p className="text-xs text-muted-foreground">Управление перевозками</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
              <UserCog className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black">Вход в систему</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Режим: {authMode === "supabase" ? "Supabase" : "mock"}
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</span>
              <div className="relative mt-2">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLocalError(""); }}
                  className="w-full bg-[#151822] border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="admin@avl84.local"
                  type="email"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Пароль</span>
              <div className="relative mt-2">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError(""); }}
                  className="w-full bg-[#151822] border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder={authMode === "mock" ? "в mock-режиме можно оставить пустым" : "пароль Supabase"}
                  type="password"
                />
              </div>
            </label>

            {(localError || error) && (
              <div className="rounded-xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
                {localError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {isLoading ? "Входим..." : "Войти"}
            </button>
          </div>

          {authMode === "mock" && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Быстрый вход для разработки</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => signInAsMockRole("admin")} className="rounded-xl border border-border bg-white/[0.03] py-3 text-sm font-semibold hover:bg-white/[0.06] transition-colors">
                  Руководитель
                </button>
                <button type="button" onClick={() => signInAsMockRole("driver")} className="rounded-xl border border-border bg-white/[0.03] py-3 text-sm font-semibold hover:bg-white/[0.06] transition-colors">
                  Водитель
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
