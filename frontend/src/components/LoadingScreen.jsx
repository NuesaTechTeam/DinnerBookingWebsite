import React from "react";
import { motion as Motion } from "framer-motion";
import logo from "../assets/logo.png";

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: (i % 6) * 0.9,
  duration: 7 + (i % 5),
  size: i % 3 === 0 ? 3 : 2,
}));

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Ambient gold glow */}
      <Motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(212,175,55,0.12) 0%, transparent 65%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <Motion.span
            key={p.id}
            className="absolute rounded-full bg-[#d4af37]"
            style={{ left: p.left, width: p.size, height: p.size }}
            initial={{ y: "105vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.8, 0.8, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Crest / Logo */}
        <Motion.img
          src={logo}
          alt="Fàájí Lawa"
          className="w-20 h-20 object-contain mb-6"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 18px rgba(212,175,55,0.45))" }}
        />

        {/* Main Title */}
        <Motion.h2
          className="text-3xl md:text-4xl font-serif font-extrabold tracking-[0.25em] uppercase mb-2 bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          FÀÁJÍ LAWA
        </Motion.h2>

        <Motion.span
          className="text-[10px] text-gray-400 font-light tracking-[0.4em] uppercase block mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          HONOR • LEGACY • AMBITION
        </Motion.span>

        {/* Animated progress bar */}
        <Motion.div
          className="w-56 h-[2px] bg-[#d4af37]/15 rounded-full overflow-hidden mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11]"
            animate={{ x: ["-120%", "320%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </Motion.div>

        {/* Animated Loading Text */}
        <Motion.p
          className="text-xs text-gray-300 font-light mb-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          Preparing your exclusive experience...
        </Motion.p>

        {/* Pulsing Dots Loader */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <Motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#d4af37]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Footer Tagline */}
        <Motion.p
          className="text-[10px] text-[#d4af37] italic font-serif tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Every legend begins with a single step into excellence
        </Motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
