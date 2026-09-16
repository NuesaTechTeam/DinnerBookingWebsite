import { Shield } from 'lucide-react';
import logo from "../../assets/logo.png";
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderHero = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const navigate = useNavigate();

  const handleSeatButton = () => {
    navigate("/book");
  };

  return (
    <header className="bg-[#09090b]/95 backdrop-blur-md border-b border-[#d4af37]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#b38728] via-[#fcf6ba] to-[#aa7c11] rounded-full flex items-center justify-center border border-[#fcf6ba]/60 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <img src={logo} alt="Fàájí Lawa logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] tracking-wider uppercase">
                FÀÁJÍ LAWA
              </h1>
              <p className="text-xs text-[#d4af37]/80 font-medium tracking-widest uppercase">
                Celebration • Culture • Elegance
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a
              onClick={() => scrollToSection("home")}
              href="#home"
              className="text-gray-300 hover:text-[#d4af37] font-medium transition-colors tracking-wider text-xs uppercase cursor-pointer"
            >
              HOME
            </a>
            <a
              onClick={() => scrollToSection("packages")}
              className="text-gray-300 hover:text-[#d4af37] font-medium transition-colors tracking-wider text-xs uppercase cursor-pointer"
            >
              PACKAGES
            </a>
            <a
              onClick={() => scrollToSection("experience")}
              className="text-gray-300 hover:text-[#d4af37] font-medium transition-colors tracking-wider text-xs uppercase cursor-pointer"
            >
              EXPERIENCE
            </a>
            <a
              onClick={() => scrollToSection("contact")}
              className="text-gray-300 hover:text-[#d4af37] font-medium transition-colors tracking-wider text-xs uppercase cursor-pointer"
            >
              CONTACT
            </a>
          </nav>

          {/* CTA Button */}
          <button
            onClick={handleSeatButton}
            className="bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black px-6 py-2 rounded-md border border-[#fcf6ba]/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transform hover:scale-105 transition-all duration-300 font-bold text-xs tracking-wider uppercase max-sm:hidden cursor-pointer"
          >
            SECURE YOUR SEAT
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderHero;