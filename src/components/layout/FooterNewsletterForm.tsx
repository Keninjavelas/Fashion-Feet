"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/subscribeNewsletter";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "already" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("idle");
    setMessage("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await subscribeNewsletter(formData);
      if (res.error) {
        setStatus("error");
        setMessage(res.error);
      } else if (res.alreadySubscribed) {
        setStatus("already");
        setMessage("You are already on our private atelier preview list!");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 6000);
      } else {
        setStatus("success");
        setMessage("Thank you! You are now subscribed to our private atelier previews.");
        setEmail("");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 6000);
      }
    });
  };

  return (
    <div className="w-full md:w-auto">
      <form
        className="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative"
        onSubmit={handleSubscribe}
        noValidate
      >
        {/* Anti-spam bot honeypot — invisible to humans */}
        <div className="absolute -left-[9999px] top-auto w-[1px] h-[1px] overflow-hidden" aria-hidden="true">
          <label htmlFor="footer_website_hp">Do not fill this field</label>
          <input
            id="footer_website_hp"
            name="website_hp"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label htmlFor="footer_newsletter_email" className="sr-only">
          Email address for the Fashion Feet newsletter
        </label>
        <input
          id="footer_newsletter_email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          className="px-6 py-3.5 bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/40 rounded-xl min-w-[280px] sm:w-[320px] disabled:opacity-50 text-sm"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
          disabled={isPending}
        />

        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3.5 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#A81B45] transition-all rounded-xl shadow-lg border border-[#D4AF37]/40 disabled:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span>Joining...</span>
            </>
          ) : status === "success" ? (
            <span className="flex items-center gap-2 text-[#D4AF37]">
              <CheckCircle2 className="w-4 h-4" /> Subscribed
            </span>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      {/* Inline Feedback Banner */}
      {status === "success" && (
        <p className="mt-2.5 text-xs text-[#D4AF37] flex items-center gap-1.5" role="status">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{message}</span>
        </p>
      )}
      {status === "already" && (
        <p className="mt-2.5 text-xs text-amber-300 flex items-center gap-1.5" role="status">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{message}</span>
        </p>
      )}
      {status === "error" && (
        <p className="mt-2.5 text-xs text-red-300 flex items-center gap-1.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{message}</span>
        </p>
      )}
    </div>
  );
}
