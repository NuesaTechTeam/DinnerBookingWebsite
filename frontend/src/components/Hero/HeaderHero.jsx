import { Shield } from 'lucide-react';
import logo from "../../assets/logo.png";
import React from 'react'
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

    const navigate = useNavigate()

    const handleSeatButton = () => {
      navigate("/book")
    }
  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-red-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center border-2 border-white/20">
              <img src={logo} alt="logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wider">
                CASABLANCA
              </h1>
              <p className="text-sm text-red-400 font-medium">
                Honor • Legacy • Ambition
              </p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              onClick={() => scrollToSection("home")}
              href="#home"
              className="text-gray-300 hover:text-red-400 font-medium transition-colors tracking-wide"
            >
              HOME
            </a>
            <a
              onClick={() => scrollToSection("packages")}
              className="text-gray-300 hover:text-red-400 font-medium transition-colors tracking-wide"
            >
              PACKAGES
            </a>
            <a
              onClick={() => scrollToSection("famiglia")}
              className="text-gray-300 hover:text-red-400 font-medium transition-colors tracking-wide"
            >
              LA FAMIGLIA
            </a>
            <a
              onClick={() => scrollToSection("contact")}
              className="text-gray-300 hover:text-red-400 font-medium transition-colors tracking-wide"
            >
              CONTACT
            </a>
          </nav>
          <button
          onClick={handleSeatButton}
          className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-2 rounded border border-red-400/50 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 font-semibold tracking-wide max-sm:hidden">
            SECURE YOUR SEAT
          </button>
        </div>
      </div>
    </header>
  );
}

export default HeaderHero