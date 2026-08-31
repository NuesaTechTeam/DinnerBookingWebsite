import React from 'react';
import logo from '../assets/logo.png'; // Updated import path

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center text-center px-4">
      {/* Crest / Logo */}
      <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-4 animate-pulse" />

      {/* Main Title */}
      <h2 className="text-xl md:text-2xl font-serif font-extrabold text-[#d4af37] tracking-widest uppercase mb-1">
        FÀÁJÍ LAWA
      </h2>
      <span className="text-[10px] text-gray-400 font-light tracking-[0.3em] uppercase block mb-8">
        PRESENTS
      </span>

      {/* Sub-Brand Text */}
      <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wider uppercase mb-1">
        CASABLANCA
      </h3>
      <span className="text-[9px] text-red-700 font-semibold tracking-[0.4em] uppercase block mb-8">
        HONOR • LEGACY • AMBITION
      </span>

      {/* Animated Loading Text */}
      <p className="text-xs text-gray-300 font-light mb-2">
        The <span className="text-red-700 italic font-medium">famiglia</span> is preparing your exclusive experience...
      </p>
      <p className="text-xs text-gray-400 font-light mb-6">
        Where legends gather and <span className="text-red-700 italic font-medium">respect is earned</span>.
      </p>

      {/* Pulsing Dots Loader */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-red-700 animate-ping"></span>
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span className="w-2 h-2 rounded-full bg-red-700 animate-ping"></span>
      </div>

      {/* Footer Tagline */}
      <p className="text-[10px] text-[#d4af37] italic font-serif">
        Every legend begins with a single step into excellence
      </p>
    </div>
  );
};

export default LoadingScreen;