"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden transition-all hover:border-[var(--color-primary)]/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-[family-name:var(--font-heading)] font-semibold text-white text-base pr-4">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp size={20} className="text-[var(--color-primary)] flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-[var(--color-text-muted)] flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 -mt-2">
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-20 relative bg-black/20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-[var(--color-primary)] font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.2em] font-medium">
            FAQ
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-bold text-white mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
