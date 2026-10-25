import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Reveal from '../Reveal.jsx';

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "What is the dress code?",
      answer: "FÀÁJÍ LAWA is a celebration of African royalty and heritage, so we invite you to dress in elegant cultural or traditional attire rather than strict black tie. Think regal aso-oke, agbada, gele, babariga, Ankara and richly embroidered African prints — or modern couture inspired by the continent. Dress to honour the culture and the grandeur of the evening."
    },
    {
      question: "What is the cancellation policy?",
      answer: "Tickets are non-refundable due to limited seating availability, but they are fully transferable up to 48 hours prior to the event date by contacting our support team."
    },
    {
      question: "Who is eligible for the discount, and which tables does it apply to?",
      answer: "The discount is exclusive to engineering students who have paid their NUESA dues, and it applies to every table tier — Bronze, Gold and Platinum. Bronze and Gold tables get ₦2,000 off per seat, while Platinum tables get ₦3,000 off per seat. To claim it, enter the invoice number on your NUESA receipt (after submitting it through the official Google Form) as your coupon code at checkout. Each invoice number covers one seat, so booking several discounted seats needs a different invoice number for each seat."
    },
    {
      question: "Can I attend if I'm not an engineering student?",
      answer: "Absolutely — the gala is open to everyone, engineering and non-engineering students alike. The ₦2,000/₦3,000 discount is a NUESA engineering-student benefit, but any guest can book any table at the regular price."
    },
    {
      question: "I have an issue with my seat — can I swap or upgrade?",
      answer: "If you'd like to swap or upgrade your seat, please visit the NUESA office and file a complaint. Our team will review your request and assist you with the next steps."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 md:px-12 lg:px-20 bg-[#050505] text-white">
      {/* Section Header */}
      <Reveal className="max-w-3xl mx-auto text-center mb-16" y={20}>
        <span className="text-[#d4af37] text-xs font-semibold tracking-[0.25em] uppercase mb-3 block">
          IMPORTANT DETAILS
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#fcf6ba] mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-400 text-sm md:text-base font-light">
          Everything you need to know about the evening's protocols.
        </p>
      </Reveal>

      {/* Accordion Container */}
      <div className="max-w-3xl mx-auto space-y-2">
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Motion.div
              key={index}
              className="border-b border-gray-800/80"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
              >
                <span className={`text-lg md:text-xl font-serif font-medium transition-colors ${
                  isOpen ? "text-[#d4af37]" : "text-gray-200 group-hover:text-[#d4af37]"
                }`}>
                  {faq.question}
                </span>
                <span className="ml-4 shrink-0 text-[#d4af37]">
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <Motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed pb-6">
                      {faq.answer}
                    </p>
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Faqs;
