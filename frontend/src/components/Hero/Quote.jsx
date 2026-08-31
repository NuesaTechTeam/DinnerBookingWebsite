import React from 'react';

const Quote = () => {
  return (
    <section 
      id="royal-lineage" 
      className="py-16 md:py-20 px-6 bg-[#050505] text-white border-y border-[#d4af37]/20 relative overflow-hidden scroll-mt-20"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-[#d4af37] text-3xl font-serif block mb-4">“</span>
        
        <p className="text-xl md:text-3xl font-serif text-[#fcf6ba] italic leading-relaxed tracking-wide mb-6">
          "A night where culture meets couture, and every moment is crafted into a timeless legacy."
        </p>

        <div className="flex items-center justify-center gap-3">
          <div className="h-[1px] w-8 bg-[#d4af37]/50" />
          <span className="text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
            FÀÁJÍ LAWA GALA
          </span>
          <div className="h-[1px] w-8 bg-[#d4af37]/50" />
        </div>
      </div>
    </section>
  );
};

export default Quote;