"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (!res?.error) {
        router.push(callbackUrl);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] transition-colors duration-300">
      <div className="w-full max-w-md bg-[var(--theme-color-surface)] p-8 shadow-2xl rounded-2xl border border-[var(--theme-color-border)] space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-color-accent)]">Fashion Feet Account</span>
          <h1 className="font-serif text-3xl text-[var(--theme-color-text)] font-bold">Welcome Back</h1>
        </div>
        
        {error && (
          <div className="p-3.5 bg-red-500/10 text-red-500 text-xs border border-red-500/20 text-center rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[11px] uppercase font-bold tracking-widest text-[var(--theme-color-text-muted)] block">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] text-sm text-[var(--theme-color-text)] rounded-xl focus:outline-none focus:border-[var(--theme-color-accent)]"
              />
              <Mail className="w-4 h-4 text-[var(--theme-color-text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase font-bold tracking-widest text-[var(--theme-color-text-muted)] block">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3.5 bg-[var(--theme-color-bg)] border border-[var(--theme-color-border)] text-sm text-[var(--theme-color-text)] rounded-xl focus:outline-none focus:border-[var(--theme-color-accent)]"
              />
              <Lock className="w-4 h-4 text-[var(--theme-color-text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-color-text-muted)] hover:text-[var(--theme-color-text)] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded accent-[var(--theme-color-jewel)]" />
              <label htmlFor="remember" className="text-xs text-[var(--theme-color-text-muted)] font-medium">Remember me</label>
            </div>
            <Link href="#" className="text-xs text-[var(--theme-color-accent)] hover:underline font-bold">Forgot Password?</Link>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#A81B45] transition-all rounded-xl shadow-lg border border-[#D4AF37]/30 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Sign In"}
          </button>
        </form>
        
        <div className="text-center text-xs text-[var(--theme-color-text-muted)] border-t border-[var(--theme-color-border)] pt-4">
          Don't have an account? <Link href="/register" className="text-[var(--theme-color-accent)] font-bold hover:underline ml-1">Register Now</Link>
        </div>
      </div>
    </div>
  );
}

export function LoginClient() {
  return (
    <Suspense fallback={<div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-[var(--theme-color-bg)]"><Loader2 className="w-8 h-8 animate-spin text-[var(--theme-color-accent)]" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
