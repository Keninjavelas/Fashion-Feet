"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { adminLogin } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";

export function AdminLoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    setPasswordChanged(new URLSearchParams(window.location.search).get("passwordChanged") === "1");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPasswordChanged(false);

    const formData = new FormData(e.currentTarget);
    const res = await adminLogin(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      router.push("/admin/mfa");
    }
  };

  return (
    <div className="min-h-screen bg-[#12080C] text-[#F6F2EB] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8A1538]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#1C1412] text-white border border-[#D4AF37]/30 shadow-2xl rounded-3xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <BrandLogo className="mx-auto mb-4 h-auto w-36 rounded-lg bg-white shadow-lg" sizes="144px" eager />
          <div className="w-14 h-14 bg-[#8A1538] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-[#D4AF37]/40 mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
            Executive Control Console
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Fashion Feet Admin</h1>
          <p className="text-white/70 text-xs font-light">
            Enter your administrator email and password, then the current code from your authenticator app.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {passwordChanged && (
          <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center text-xs text-emerald-200">
            Password changed. Sign in again with your new password.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                id="admin-email"
                type="email"
                name="email"
                required
                autoComplete="username"
                placeholder="admin@fashionfeet.com"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 hover:text-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg border border-[#D4AF37]/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Continue to MFA</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 text-center">
          <span className="text-[10px] text-white/50 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Mandatory TOTP MFA Enabled
          </span>
          <p className="mt-2 text-[10px] leading-relaxed text-white/45">
            Sessions end after 30 minutes of inactivity. Sign in again with your existing credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
