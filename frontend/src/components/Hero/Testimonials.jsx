import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Reveal from '../Reveal.jsx';

const Testimonials = () => {
  const reviews = [
    {
      quote: "AN EVENING OF UNPARALLELED SOPHISTICATION. THE ATMOSPHERE AND CULINARY ARTISTRY WERE ABSOLUTELY INTOXICATING.",
      author: "Chief O. Adebayo",
      role: "VVIP Guest",
      stars: 5,
    },
    {
      quote: "THE FINEST CELEBRATION OF PAN-AFRICAN HIGH CULTURE AND GASTRONOMY I HAVE EVER EXPERIENCED.",
      author: "Lady K. Mensah",
      role: "Cultural Patron",
      stars: 5,
    },
    {
      quote: "EXQUISITE DETAILS, WORLD-CLASS ENTERTAINMENT, AND ROYAL HOSPITALITY FROM START TO FINISH.",
      author: "Dr. E. Nwachukwu",
      role: "Gala Attendee",
      stars: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const review = reviews[currentIndex];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-20 bg-[#050505] text-white border-y border-[#d4af37]/20 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Section Header */}
      <Reveal className="max-w-3xl mx-auto text-center mb-12 relative z-10" y={20}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold uppercase tracking-widest text-white">
          WHAT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11]">ROYALTY</span> SAYS
        </h2>
      </Reveal>

      {/* Carousel Card Container */}
      <div className="max-w-3xl mx-auto relative z-10 min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <Motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="bg-[#0a0a0a] border border-[#d4af37]/40 rounded-2xl p-8 md:p-10 text-center shadow-[0_0_25px_rgba(212,175,55,0.1)]">
              {/* 5-Star Rating */}
              <div className="flex justify-center gap-1.5 mb-6 text-[#d4af37]">
                {[...Array(review.stars)].map((_, i) => (
                  <Motion.svg
                    key={i}
                    className="w-4 h-4 fill-current drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]"
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </Motion.svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-base sm:text-lg md:text-xl font-serif text-[#fcf6ba] italic tracking-wide leading-relaxed mb-6 uppercase">
                "{review.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
                  — {review.author}
                </span>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-xs text-gray-400 font-light uppercase">
                  {review.role}
                </span>
              </div>
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 mt-8 relative z-10">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-[#b38728] to-[#fcf6ba]'
                : 'w-2 bg-gray-700 hover:bg-[#d4af37]/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
