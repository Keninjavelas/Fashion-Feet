"use client";

import { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { adminLogin } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export function AdminLoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
          <div className="w-14 h-14 bg-[#8A1538] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-[#D4AF37]/40 mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
            Executive Control Console
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Fashion Feet Admin</h1>
          <p className="text-white/70 text-xs font-light">
            Isolated administrator authentication. Enter your email and password to proceed to TOTP MFA verification.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@fashionfeet.com"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
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
        </div>
      </div>
    </div>
  );
}
