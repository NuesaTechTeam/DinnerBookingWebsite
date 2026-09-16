import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import heroBg from '../../assets/hero background.png';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 41) % 100}%`,
  delay: (i % 7) * 0.8,
  duration: 8 + (i % 6),
  size: i % 3 === 0 ? 3 : 2,
}));

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden">
      {/* Background Image Layer with slow zoom */}
      <Motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
      />

      {/* Dark Gradient Overlay to ensure text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/80 pointer-events-none" />

      {/* Floating gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <Motion.span
            key={p.id}
            className="absolute rounded-full bg-[#d4af37]"
            style={{ left: p.left, width: p.size, height: p.size }}
            initial={{ y: '105vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.7, 0.7, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <Motion.div
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Title with Gold Lines */}
        <Motion.div
          variants={item}
          className="flex items-center justify-center gap-4 sm:gap-8 w-full mb-4"
        >
          <Motion.div
            className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#d4af37]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: 'right' }}
          />
          <Motion.h1
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] uppercase font-serif drop-shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ backgroundSize: '200% 200%' }}
          >
            FÀÁJÍ LAWA
          </Motion.h1>
          <Motion.div
            className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#d4af37]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: 'left' }}
          />
        </Motion.div>

        {/* Subheading */}
        <Motion.h2
          variants={item}
          className="text-2xl sm:text-4xl md:text-5xl font-serif text-white tracking-wide font-medium max-w-3xl leading-snug mb-6 drop-shadow-md"
        >
          Experience the Ultimate African Gala Dinner
        </Motion.h2>

        {/* Short Description */}
        <Motion.p
          variants={item}
          className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-10"
        >
          A night of sensory opulence where high-fashion African couture meets
          exquisite pan-African gastronomy and legendary musical performances.
        </Motion.p>

        {/* Call to Action Buttons */}
        <Motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-12 w-full justify-center"
        >
          <Link to="/book" className="w-full sm:w-auto">
            <Motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold text-xs sm:text-sm tracking-widest px-8 py-3.5 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer uppercase"
            >
              RESERVE YOUR TABLE
            </Motion.button>
          </Link>

          <a href="#packages" className="w-full sm:w-auto">
            <Motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto bg-transparent border border-[#d4af37]/60 text-white font-semibold text-xs sm:text-sm tracking-widest px-8 py-3.5 rounded-lg hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all cursor-pointer uppercase"
            >
              EXPLORE MENU
            </Motion.button>
          </a>
        </Motion.div>

        {/* Date Badge */}
        <Motion.div
          variants={item}
          className="flex items-center gap-3 border border-[#d4af37]/40 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-lg shadow-lg"
          animate={{ boxShadow: [
            '0 0 0px rgba(212,175,55,0.0)',
            '0 0 18px rgba(212,175,55,0.35)',
            '0 0 0px rgba(212,175,55,0.0)',
          ] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="w-1.5 h-4 bg-[#d4af37] rounded-full" />
          <span className="text-xs sm:text-sm tracking-[0.2em] text-[#d4af37] font-semibold uppercase">
            SATURDAY, OCTOBER 31ST, 2026
          </span>
        </Motion.div>
      </Motion.div>
    </section>
  );
};

export default Hero;
