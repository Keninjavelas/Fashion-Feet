"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A single public FAQ entry.
 *
 * This is the shape the FAQ page loads from the `Faq` table. There is exactly one
 * source of truth for FAQ content: the database. Nothing is hardcoded here, so the
 * storefront and `GET /api/v1/faqs` can never drift apart again.
 */
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  displayOrder: number;
};

type FaqSection = {
  category: string;
  items: FaqItem[];
};

/**
 * Groups rows by category without reordering them.
 *
 * The incoming list is already ordered by `isPinned desc, displayOrder asc` — the
 * same ordering the public API uses — so a category's section position is decided
 * by the first row that carries it.
 */
function groupByCategory(faqs: FaqItem[]): FaqSection[] {
  const sections: FaqSection[] = [];
  const byCategory = new Map<string, FaqSection>();

  for (const faq of faqs) {
    let section = byCategory.get(faq.category);

    if (!section) {
      section = { category: faq.category, items: [] };
      byCategory.set(faq.category, section);
      sections.push(section);
    }

    section.items.push(faq);
  }

  return sections;
}

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggleAccordion = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const hasFaqs = faqs.length > 0;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sections = groupByCategory(
    normalizedQuery
      ? faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(normalizedQuery) ||
            faq.answer.toLowerCase().includes(normalizedQuery)
        )
      : faqs
  );

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">

        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-brand-900)] tracking-tight mb-4 font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-10">Everything you need to know about Fashion Feet — our products, our collections, and how to reach us.</p>

          {hasFaqs && (
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] text-black focus:outline-none focus:border-[var(--color-brand-900)] text-base transition-colors rounded-2xl"
              />
            </div>
          )}
        </div>

        {!hasFaqs && (
          <div className="text-center border border-black/10 bg-[var(--color-brand-50)] rounded-2xl px-6 py-16">
            <p className="font-serif text-xl md:text-2xl font-bold text-[var(--color-brand-900)]">
              Our FAQs are being updated — please check back shortly.
            </p>
            <p className="text-gray-600 text-sm mt-4">
              If you have a question in the meantime, our team is happy to help directly.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-6 text-[var(--color-brand-900)] font-bold text-xs uppercase tracking-widest hover:text-[var(--color-accent-gold)] transition-colors"
            >
              Contact Us →
            </Link>
          </div>
        )}

        {hasFaqs && sections.length === 0 && (
          <p className="text-center text-gray-600 text-sm">
            No questions match your search. Try a different word, or{" "}
            <Link href="/contact" className="text-[var(--color-brand-900)] font-bold hover:text-[var(--color-accent-gold)] transition-colors">
              contact us
            </Link>
            .
          </p>
        )}

        <div className="space-y-16">
          {sections.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 pb-4 mb-6">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => {
                  const isOpen = openId === item.id;

                  return (
                    <div key={item.id} className="border border-black/10 bg-white rounded-2xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleAccordion(item.id)}
                        className="w-full flex justify-between items-center p-6 text-left hover:bg-[var(--color-brand-50)] transition-colors"
                      >
                        <span className={`font-serif text-lg font-bold pr-8 ${isOpen ? 'text-[var(--color-brand-900)]' : 'text-gray-900'}`}>
                          {item.question}
                        </span>
                        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-brand-900)]' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-black/5 mt-2 text-sm">
                              <p className="mt-4">{item.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
