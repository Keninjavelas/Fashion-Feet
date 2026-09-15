"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "OUR PHILOSOPHY & BOUTIQUE FIT",
    questions: [
      {
        q: "Why doesn't Fashion Feet offer online shopping?",
        a: "Fashion Feet Juttis are experienced and selected in person at our luxury boutique showrooms to ensure the right fit, feel, and finish. Because genuine handcrafted Punjabi footwear is made from 100% natural leather and double memory foam cushioning, each pair molds uniquely to your feet. We offer direct online Product Fitting Enquiries so you can reserve pairs and consult with our master fitters before visiting our boutique showrooms."
      },
      {
        q: "How can I find my correct Jutti size?",
        a: "Use our interactive Size Finder to convert your existing US, UK, EU, or Indian shoe size and find your recommended Fashion Feet size.",
        link: { text: "Open Size Finder →", url: "/size-guide" }
      },
      {
        q: "Are Fashion Feet sizes the same as regular factory shoes?",
        a: "Handmade Juttis can fit differently than standard factory sneakers. As each pair is 100% handcrafted from natural leather, it stretches by 1-2mm after 2-3 wears to mold perfectly to your feet."
      },
      {
        q: "Can I save products I like?",
        a: "Yes! You can click the heart icon (♡) on any product to save it to your Favorites. You can view your saved items anytime from your Profile."
      },
      {
        q: "How do I submit a boutique fitting enquiry?",
        a: "Simply click 'Enquire' on any product page or in the header. Our concierge team will pre-populate your selected size, product code, and preferred boutique location for an in-person fitting."
      }
    ]
  },
  {
    category: "OUR COLLECTIONS",
    questions: [
      {
        q: "How often do you introduce new collections?",
        a: "We release new collections seasonally, with special drops arriving right before major festivals. You can turn on 'New Collection Launches' in your Profile notifications to stay updated."
      },
      {
        q: "Do you have Juttis for both men and women?",
        a: "Yes, we offer extensive collections crafted specifically for both men and women, tailored to different foot structures and style preferences."
      },
      {
        q: "Will you launch special festive collections?",
        a: "Absolutely. We curate exclusive festive collections for Diwali, Eid, Holi, Lohri, Baisakhi, Christmas, and the Wedding season featuring richer embroideries and premium materials."
      }
    ]
  },
  {
    category: "STORES & BOUTIQUES",
    questions: [
      {
        q: "Where can I find a Fashion Feet store?",
        a: "We are located in Delhi (Greater Kailash), Mumbai (Juhu), and Chandigarh (Sector 17). You can visit our Find a Store page to get direct directions and opening hours.",
        link: { text: "Find a Store →", url: "/stores" }
      }
    ]
  },
  {
    category: "MY ACCOUNT",
    questions: [
      {
        q: "Do I need an account to browse Fashion Feet?",
        a: "Not at all. You can freely browse all our collections, use the Size Finder, and explore seasonal drops without an account."
      },
      {
        q: "How do I create an account?",
        a: "Click the user icon in the top navigation bar to create your account."
      },
      {
        q: "How do I save a Jutti to my Favorites?",
        a: "Simply click the heart icon on any product card or product details page."
      },
      {
        q: "How do I change my saved shoe size?",
        a: "You can update your saved size anytime by visiting the 'My Size' section in your Profile and launching the Size Finder.",
        link: { text: "Go to Profile →", url: "/profile" }
      }
    ]
  }
];

export function FaqClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>("Why doesn't Fashion Feet offer online shopping?");

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-brand-900)] tracking-tight mb-4 font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-10">Everything you need to know about Fashion Feet in-person boutique fittings and handcrafted Punjabi Juttis.</p>
          
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
        </div>

        <div className="space-y-16">
          {faqs.map((section) => {
            const filteredQuestions = section.questions.filter(q => 
              q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
              q.a.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredQuestions.length === 0) return null;

            return (
              <div key={section.category}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 pb-4 mb-6">
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {filteredQuestions.map((item) => {
                    const currentIndex = item.q;
                    const isOpen = openIndex === currentIndex;
                    
                    return (
                      <div key={item.q} className="border border-black/10 bg-white rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleAccordion(currentIndex)}
                          className="w-full flex justify-between items-center p-6 text-left hover:bg-[var(--color-brand-50)] transition-colors"
                        >
                          <span className={`font-serif text-lg font-bold pr-8 ${isOpen ? 'text-[var(--color-brand-900)]' : 'text-gray-900'}`}>
                            {item.q}
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
                                <p className="mt-4">{item.a}</p>
                                {item.link && (
                                  <Link href={item.link.url} className="inline-block mt-4 text-[var(--color-brand-900)] font-bold text-xs uppercase tracking-widest hover:text-[var(--color-accent-gold)] transition-colors">
                                    {item.link.text}
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
