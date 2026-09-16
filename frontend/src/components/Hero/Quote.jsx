import React from 'react';
import { motion as Motion } from 'framer-motion';
import Reveal from '../Reveal.jsx';

const Quote = () => {
  return (
    <section
      id="royal-lineage"
      className="py-16 md:py-20 px-6 bg-[#050505] text-white border-y border-[#d4af37]/20 relative overflow-hidden scroll-mt-20"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

      <Reveal className="max-w-4xl mx-auto text-center relative z-10" y={20}>
        <Motion.span
          className="text-[#d4af37] text-3xl font-serif block mb-4"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          &ldquo;
        </Motion.span>

        <p className="text-xl md:text-3xl font-serif text-[#fcf6ba] italic leading-relaxed tracking-wide mb-6">
          "A night where culture meets couture, and every moment is crafted into a timeless legacy."
        </p>

        <div className="flex items-center justify-center gap-3">
          <Motion.div
            className="h-[1px] w-8 bg-[#d4af37]/50"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ transformOrigin: 'right' }}
          />
          <span className="text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
            FÀÁJÍ LAWA GALA
          </span>
          <Motion.div
            className="h-[1px] w-8 bg-[#d4af37]/50"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </Reveal>
    </section>
  );
};

export default Quote;
