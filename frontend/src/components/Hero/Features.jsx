import React from 'react';
import { motion as Motion } from 'framer-motion';
import Reveal from '../Reveal.jsx';

const Features = () => {
  const stats = [
    { value: '07', label: 'MASTER CHEFS' },
    { value: '05', label: 'LIVE ORCHESTRAS' },
    { value: '12', label: 'AFRICAN COUNTRIES' },
  ];

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Text Content */}
        <Reveal className="flex flex-col justify-center" y={36}>
          {/* Eyebrow Header */}
          <span className="text-[#d4af37] text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-3">
            HERITAGE & ELEGANCE
          </span>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#fcf6ba] leading-tight mb-8">
            A Cultural Tapestry of Gastronomy and Music
          </h2>

          {/* Body Paragraphs */}
          <div className="space-y-6 text-gray-300 text-sm md:text-base font-light leading-relaxed mb-12">
            <p>
              Fàájí Lawa is a curated celebration designed to immerse you in the rich
              grandeur of the continent. From custom-scented tablescapes inspired by
              the botanical landscapes of East Africa, to a masterfully curated symphony
              of traditional strings and modern Afro-soul.
            </p>
            <p>
              Our master chefs present an unforgettable fine dining journey. Witness
              heritage recipes from Cape Town to Cairo reimagined with modern culinary
              artistry and luxury ingredients, paired exclusively with reserve vintage
              wines.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#d4af37]/20">
            {stats.map((stat, index) => (
              <Motion.div
                key={index}
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.15 * index }}
              >
                <span className="text-3xl md:text-4xl font-serif font-bold text-[#d4af37] tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase mt-1">
                  {stat.label}
                </span>
              </Motion.div>
            ))}
          </div>
        </Reveal>

        {/* Right Column: Culinary Image */}
        <Reveal className="relative" delay={0.15} y={36}>
          <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000"
              alt="Fine African Gastronomy"
              className="w-full h-[400px] sm:h-[500px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Features;
