"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { X, AlertTriangle, Lock, Trash2, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { verifyUserPassword, deleteUserAccount } from "@/app/actions/userAccount";

export function DeleteAccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [password, setPassword] = useState("");
  const [confirmationInput, setConfirmationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPassword("");
      setConfirmationInput("");
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Trap focus & Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Step 2: Validate Password
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await verifyUserPassword(password);
    setLoading(false);

    if (res.success) {
      setStep(3);
    } else {
      setError(res.error || "Password verification failed.");
    }
  };

  // Step 3: Execute Account Deletion
  const handleDeleteAccount = async () => {
    if (confirmationInput !== "DELETE") return;
    setLoading(true);
    setError(null);

    const res = await deleteUserAccount(password);

    if (res.success) {
      // Invalidate active session, log user out, redirect to homepage
      await signOut({ callbackUrl: "/?accountDeleted=true" });
    } else {
      setLoading(false);
      setError(res.error || "Failed to delete account.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
      <div ref={modalRef} className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl border border-black/10 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-rose-950 text-white p-6 relative border-b border-rose-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 text-rose-400 text-xs uppercase tracking-widest font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Account Deletion Security Flow (Step {step} of 3)
          </div>
          <h2 className="font-serif text-2xl font-medium text-white">Delete Your Account?</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Warning Overview */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-900">This action is permanent</p>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Deleting your Fashion Feet account will permanently remove:
                </p>
                <ul className="space-y-1 text-xs text-rose-800 font-medium pl-4 list-disc">
                  <li>Profile & Personal Contact Info</li>
                  <li>Saved Favorites Wishlist</li>
                  <li>Saved Foot Size Profile</li>
                  <li>Fitting Preferences & Notes</li>
                  <li>Notification Settings & Subscriptions</li>
                </ul>
                <p className="text-[11px] font-semibold text-rose-900 pt-1">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 text-xs font-medium uppercase tracking-wider rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-rose-600 text-white text-xs font-medium uppercase tracking-wider rounded-md hover:bg-rose-700 transition-colors shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-600"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Password Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-widest text-gray-700">
                  Step 2: Enter Password to Verify Identity
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-9 pr-4 py-2.5 border border-black/15 text-sm rounded-md text-gray-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-900 underline"
                >
                  &larr; Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium uppercase tracking-wider rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-rose-600 text-white text-xs font-medium uppercase tracking-wider rounded-md hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Password"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Explicit Text Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium uppercase tracking-widest text-gray-700">
                  Step 3: Final Security Confirmation
                </label>
                <p className="text-xs text-gray-600">
                  To confirm permanent account deletion, please type <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">DELETE</span> below:
                </p>
                <input
                  type="text"
                  required
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2.5 border border-black/15 text-sm font-mono rounded-md text-gray-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-gray-500 hover:text-gray-900 underline"
                >
                  &larr; Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium uppercase tracking-wider rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={confirmationInput !== "DELETE" || loading}
                    className="px-6 py-2.5 bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-rose-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {loading ? "Deleting..." : "Permanently Delete Account"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
