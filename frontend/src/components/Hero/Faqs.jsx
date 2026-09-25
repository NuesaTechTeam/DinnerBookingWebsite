import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Reveal from '../Reveal.jsx';

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "What is the dress code?",
      answer: "The dress code for the evening is Black Tie or High-Fashion African Black-Tie Couture. We encourage guests to embrace rich textures, traditional royal attire, or modern black-tie formalwear."
    },
    {
      question: "Can I make dietary requests?",
      answer: "Yes, our master chefs accommodate all dietary restrictions, including halal, vegan, vegetarian, and allergy-specific preparations. Please specify your requirements during checkout or via the contact inquiry form."
    },
    {
      question: "Is parking available?",
      answer: "Complimentary valet parking is available at the venue entrance for all ticket holders. Secure, guarded parking facilities are provided throughout the duration of the gala."
    },
    {
      question: "What is the cancellation policy?",
      answer: "Tickets are non-refundable due to limited seating availability, but they are fully transferable up to 48 hours prior to the event date by contacting our support team."
    },
    {
      question: "Are children allowed?",
      answer: "FÀÁJÍ LAWA is an exclusive adult-only gala experience designed for guests aged 18 and above."
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
