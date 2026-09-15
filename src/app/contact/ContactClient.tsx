"use client";

import { useState } from "react";
import { Mail, Phone, Clock } from "lucide-react";

export function ContactClient() {
  const [reason, setReason] = useState("General Inquiry");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[var(--color-brand-50)]">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-brand-900)] tracking-tight mb-4 font-bold">We'd Love to Hear From You</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question about our collections, sizing, or Fashion Feet? Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-0 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Contact Information */}
          <div className="lg:col-span-2 bg-[var(--color-brand-900)] text-white p-10 md:p-12 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[var(--color-accent-gold)]/10 rounded-full blur-3xl"></div>
            
            <div>
              <h2 className="font-serif text-2xl font-bold mb-10 text-[var(--color-accent-gold)]">Contact Information</h2>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-[var(--color-accent-gold)] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-1">Email</p>
                    <p className="text-base font-medium">hello@fashionfeet.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-[var(--color-accent-gold)] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-1">Phone</p>
                    <p className="text-base font-medium">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[var(--color-accent-gold)] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-1">Business Hours</p>
                    <p className="text-base font-medium">Mon-Sat: 10:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/10 text-xs text-white/60">
              Fashion Feet Punjabi Footwear Showrooms — Coming Soon across major locations.
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white p-10 md:p-12 border border-black/5">
            <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-8 font-bold">Send a Message</h2>
            
            {isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center">
                <h3 className="font-serif text-xl mb-2 font-bold">Message Sent Successfully!</h3>
                <p className="text-xs">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                    <input type="text" required className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)]" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                    <input type="email" required className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)]" placeholder="your@email.com" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Subject</label>
                  <select 
                    className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] appearance-none bg-white"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option>General Inquiry</option>
                    <option>Product Inquiry</option>
                    <option>Size & Fit</option>
                    <option>Store Information</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </select>
                </div>

                {reason === "Product Inquiry" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Product Name or Code (Optional)</label>
                    <input type="text" className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)]" placeholder="e.g. FF-W-1042" />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                  <textarea 
                    rows={4} 
                    required
                    className="w-full border border-black/15 p-3 text-black rounded-xl focus:outline-none focus:border-[var(--color-brand-900)] resize-none" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-10 py-4 bg-[var(--color-brand-900)] text-white font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-brand-900)] transition-all rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
