"use client";

import { useState, useEffect } from "react";
import { QrCode, ShieldCheck, KeyRound, ArrowRight, Loader2, Copy, Check, Info } from "lucide-react";
import { setupMfaSecret, verifyAdminMfa } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AdminMfaClientProps {
  adminEmail: string;
  mfaEnabled: boolean;
}

export function AdminMfaClient({ adminEmail, mfaEnabled }: AdminMfaClientProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mfaEnabled) {
      setupMfaSecret().then((res) => {
        if (res.qrCodeUrl) {
          setQrCodeUrl(res.qrCodeUrl);
          setSecret(res.secret || null);
        }
      });
    }
  }, [mfaEnabled]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await verifyAdminMfa(code, false);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      if (res.recoveryCodes && res.recoveryCodes.length > 0) {
        setRecoveryCodes(res.recoveryCodes);
      } else {
        router.push("/admin");
      }
    }
  };

  const handleCopyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#12080C] text-[#F6F2EB] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8A1538]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-lg bg-[#1C1412] text-white border border-[#D4AF37]/30 shadow-2xl rounded-3xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#8A1538] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-[#D4AF37]/40 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
            Mandatory Multi-Factor Authentication
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            {mfaEnabled ? "Enter Authenticator Code" : "Set Up MFA Authenticator"}
          </h1>
          <p className="text-white/70 text-xs font-light">
            Account: <strong className="text-[#D4AF37] font-mono">{adminEmail}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* First Time QR Code Setup Enrollment */}
        {!mfaEnabled && qrCodeUrl && (
          <div className="p-5 bg-black/40 rounded-2xl border border-white/10 space-y-4 text-center">
            <p className="text-xs text-white/80 font-light">
              Scan this QR Code with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>1Password</strong>:
            </p>

            <div className="relative w-44 h-44 mx-auto p-2 bg-white rounded-xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="TOTP QR Code" className="w-full h-full object-contain" />
            </div>

            {secret && (
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[11px] font-mono text-white/70">
                Key: <strong className="text-[#D4AF37] select-all">{secret}</strong>
              </div>
            )}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-1">
              6-Digit Authenticator Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-center font-mono text-2xl font-bold tracking-[0.5em] text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3.5 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg border border-[#D4AF37]/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Log In</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </>
            )}
          </button>
        </form>

        {/* Recovery Code Screen Modal */}
        {recoveryCodes.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#1C1412] text-white border border-[#D4AF37]/40 rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest">
                <KeyRound className="w-4 h-4" /> Save One-Time Recovery Codes
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-white">Your Backup Recovery Codes</h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  Store these 8 codes in a safe password manager. If you lose your authenticator device, each code can be used <strong>once</strong> to log in.
                </p>
              </div>

              <div className="p-4 bg-black/50 rounded-2xl border border-white/10 font-mono text-sm text-[#D4AF37] grid grid-cols-2 gap-2 text-center select-all">
                {recoveryCodes.map((c, i) => (
                  <span key={i} className="p-1.5 bg-white/5 rounded border border-white/5">{c}</span>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyRecoveryCodes}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Codes"}
                </button>

                <button
                  onClick={() => router.push("/admin")}
                  className="flex-1 py-3 bg-[#8A1538] hover:bg-[#A81B45] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg border border-[#D4AF37]/40 transition-all"
                >
                  I Saved My Codes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
