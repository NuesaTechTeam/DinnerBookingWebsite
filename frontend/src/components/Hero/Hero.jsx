import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../../assets/hero background.png'; // Path to your background image

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Dark Gradient Overlay to ensure text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/80 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* Title with Gold Lines */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 w-full mb-4">
          <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#d4af37]" />
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] uppercase font-serif drop-shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
            FÀÁJÍ LAWA
          </h1>
          <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>

        {/* Subheading */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-white tracking-wide font-medium max-w-3xl leading-snug mb-6 drop-shadow-md">
          Experience the Ultimate African Gala Dinner
        </h2>

        {/* Short Description */}
        <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-10">
          A night of sensory opulence where high-fashion African couture meets
          exquisite pan-African gastronomy and legendary musical performances.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-12 w-full justify-center">
          <Link to="/book" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold text-xs sm:text-sm tracking-widest px-8 py-3.5 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer uppercase">
              RESERVE YOUR TABLE
            </button>
          </Link>

          <a href="#packages" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-transparent border border-[#d4af37]/60 text-white font-semibold text-xs sm:text-sm tracking-widest px-8 py-3.5 rounded-lg hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all cursor-pointer uppercase">
              EXPLORE MENU
            </button>
          </a>
        </div>

        {/* Date Badge */}
        <div className="flex items-center gap-3 border border-[#d4af37]/40 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-lg shadow-lg">
          <span className="w-1.5 h-4 bg-[#d4af37] rounded-full" />
          <span className="text-xs sm:text-sm tracking-[0.2em] text-[#d4af37] font-semibold uppercase">
            SATURDAY, DECEMBER 14TH, 2026
          </span>
        </div>

      </div>
    </section>
  );
};

export default Hero;