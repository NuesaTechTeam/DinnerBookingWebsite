import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import Reveal from '../Reveal.jsx';
import jollofImage from '../../assets/jollof-rice.jpg';
import ofadaImage from '../../assets/ofada-rice.jpg';

const images = [
  { src: jollofImage, alt: 'Jollof rice' },
  { src: ofadaImage, alt: 'Ofada rice' },
];

const Features = () => {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
            The Grand Celebration of Culture, Style &amp; Unmatched Energy
          </h2>

          {/* Body Paragraphs */}
          <div className="space-y-6 text-gray-300 text-sm md:text-base font-light leading-relaxed">
            <p>
              Step into an unforgettable night where traditional elegance meets modern
              celebration.
            </p>
            <p>
              We&rsquo;ve put in the work&mdash;now it&rsquo;s time to unwind, celebrate our
              resilience, and party like royalty.
            </p>
          </div>
        </Reveal>

        {/* Right Column: Culinary Image Slideshow */}
        <Reveal className="relative" delay={0.15} y={36}>
          <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] group">
            <div className="relative w-full h-[400px] sm:h-[500px]">
              {images.map((image, index) => (
                <Motion.img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  initial={false}
                  animate={{
                    opacity: index === activeImage ? 1 : 0,
                    scale: index === activeImage ? 1 : 1.06,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ))}
            </div>
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeImage
                      ? 'w-6 bg-[#d4af37]'
                      : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Features;
