import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Hamburger from "./Hamburger.jsx";
import { motion as Motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation click handler for smooth scrolling to sections
  const handleNavClick = (e, url) => {
    if (url.includes("#")) {
      e.preventDefault();
      const targetId = url.split("#")[1];

      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  const navLinks = [
    { title: "HOME", url: "/" },
    { title: "PACKAGES", url: "/#packages" },
    { title: "ROYAL LINEAGE", url: "/#royal-lineage" },
    { title: "CONTACT", url: "/#contact" },
  ];

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[#d4af37]/20 w-full mx-auto flex items-center justify-between py-3 px-6 md:px-12 shadow-2xl">
        {/* Logo and Branding Section */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="FÀÁJÍ LAWA" 
            className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" 
          />
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-extrabold tracking-widest text-[#d4af37] font-serif leading-tight">
              FÀÁJÍ LAWA
            </h1>
            <span className="text-[9px] tracking-[0.2em] text-[#a88a2a] uppercase font-medium">
              HONOR • LEGACY • AMBITION
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-x-8">
          {navLinks.map((link) => (
            <a
              key={link.title}
              href={link.url}
              onClick={(e) => handleNavClick(e, link.url)}
              className={`text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                location.pathname === link.url
                  ? "text-[#fcf6ba] border-b-2 border-[#d4af37] pb-1"
                  : "text-gray-300 hover:text-[#d4af37]"
              }`}
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* Action Button Section */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="h-6 w-[1px] bg-[#d4af37]/30" />
          <Link to="/book">
            <button className="bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider px-6 py-2.5 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all cursor-pointer uppercase">
              SECURE YOUR SEAT
            </button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button className="lg:hidden z-50 text-[#d4af37]">
          <Hamburger setMobileMenu={setIsOpen} mobileMenu={isOpen} />
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[#080808] z-40 flex flex-col justify-center items-center space-y-6 lg:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.title}
                href={link.url}
                onClick={(e) => handleNavClick(e, link.url)}
                className="text-lg font-bold tracking-widest text-gray-200 hover:text-[#d4af37] cursor-pointer"
              >
                {link.title}
              </a>
            ))}
            <Link to="/book" onClick={() => setIsOpen(false)}>
              <button className="mt-4 bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold text-sm tracking-wider px-8 py-3 rounded-lg shadow-lg uppercase">
                SECURE YOUR SEAT
              </button>
            </Link>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;