"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 4000);
  };

  return (
    <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative" onSubmit={handleSubscribe}>
      <input 
        type="email" 
        placeholder="Enter your email address" 
        className="px-6 py-3.5 bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] rounded-xl min-w-[280px] disabled:opacity-50 text-sm"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={subscribed}
      />
      <button 
        type="submit" 
        disabled={subscribed}
        className="px-8 py-3.5 bg-[#8A1538] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#A81B45] transition-all rounded-xl shadow-lg border border-[#D4AF37]/40 disabled:opacity-80"
      >
        {subscribed ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#D4AF37]"/> Subscribed</span> : "Subscribe"}
      </button>
    </form>
  );
}
