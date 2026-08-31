import React from 'react';
import { Link } from 'react-router-dom';
import nuesaLogo from '../../assets/logo.png'; // Make sure your NUESA logo image is inside src/assets

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-white pt-16 pb-12 px-6 md:px-12 lg:px-20 border-t border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-gray-800/80">
          
          {/* Brand Info with NUESA Logo on the Left */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={nuesaLogo} 
                  alt="NUESA Logo" 
                  className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" 
                />
                <div className="h-7 w-[1px] bg-[#d4af37]/40" />
                <h2 className="text-3xl font-serif font-extrabold text-[#d4af37] tracking-widest uppercase">
                  FÀÁJÍ LAWA
                </h2>
              </div>
              <p className="text-gray-400 text-sm md:text-base font-light max-w-sm leading-relaxed">
                The premier cultural and high-fashion gathering celebrating luxury, legacy, and beautiful African narratives.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-[#d4af37] uppercase mb-6">
              NAVIGATION
            </h3>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#packages" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  Packages
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#faqs" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-[#d4af37] uppercase mb-6">
              FOLLOW THE LEGACY
            </h3>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  X / Twitter
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#d4af37] transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-light gap-4">
          <p>© 2026 <span className="font-semibold text-gray-400">FÀÁJÍ LAWA</span>. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-[#d4af37] transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-[#d4af37] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;