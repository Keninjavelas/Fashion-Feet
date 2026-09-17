"use client";

import { Hand, Scissors, ShieldCheck, Feather } from "lucide-react";

const features = [
  {
    icon: Hand,
    title: "100% Handcrafted",
    description: "Every pair is meticulously handcrafted thread-by-thread by Punjabi artisans.",
  },
  {
    icon: ShieldCheck,
    title: "Vegetable Tanned Leather",
    description: "Sourced from premier tanneries for natural breathability and elegance.",
  },
  {
    icon: Feather,
    title: "Double Cushion Comfort",
    description: "Layered velvet arch insoles to keep your feet easeful all day long.",
  },
  {
    icon: Scissors,
    title: "Heritage Artistry",
    description: "Authentic Zari and Dabka threadwork techniques passed down across generations.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] border-t border-[var(--theme-color-border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center group p-6 bg-[var(--theme-color-surface)] rounded-2xl border border-[var(--theme-color-border)] shadow-md hover:border-[var(--theme-color-accent)] transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--theme-color-bg)] flex items-center justify-center mb-4 group-hover:bg-[var(--theme-color-jewel)] group-hover:text-white transition-colors duration-300 border border-[var(--theme-color-border)]">
                  <Icon className="w-7 h-7 text-[var(--theme-color-accent)] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--theme-color-text)] tracking-wide mb-2">{feature.title}</h3>
                <p className="text-[var(--theme-color-text-muted)] text-xs leading-relaxed max-w-xs">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
