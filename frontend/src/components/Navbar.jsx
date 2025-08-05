import { useState } from "react";
import { navbarLinks, socialLinks } from "../lib/constants";
import {Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { DropdownMenu } from "radix-ui";
import Hamburger from "./Hamburger.jsx";
import { motion as Motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();


  const overlayVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const linkVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const socialVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  return (
    <>
      <nav className='fixed left-0 top-0 z-999 bg-white/80 backdrop-blur-md w-full mx-auto flex items-center justify-between py-2 shadow-md px-4 md:px-8 lg:px-12'>
        <Link to='/' className='flex items-center gap-2'>
          <img src={logo} alt='nuesa abuad' height={40} width={20} />
          <h1>NUESA ABUAD</h1>
        </Link>
        <div className='hidden md:flex items-center gap-x-4'>
          {navbarLinks.map((link) => (
            <Link
              key={link.title}
              to={link.url}
              className={`px-4 py-2 text-gray-700 hover:bg-green-100 rounded ${
                location.pathname === link.url ? "bg-green-500" : ""
              }`}
            >
              {link.title}
            </Link>
          ))}
        </div>
        <button className='bg-[#D4AF37] sm:block hidden text-white px-5 py-1 rounded-sm text-md font-cinzel hover:bg-[#f1f1f1] hover:text-[#D4AF37] transition-colors'>
          Book a seat
        </button>
        <button className='md:hidden z-50'>
          <Hamburger setMobileMenu={setIsOpen} mobileMenu={isOpen} />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='fixed inset-0 bg-white z-40 flex flex-col md:hidden'
          >
            <div className='flex-1 flex flex-col justify-center items-center space-y-6'>
              {navbarLinks.map((link, index) => (
                <Motion.div
                  key={index}
                  variants={linkVariants}
                  className={`text-lg font-medium flex items-center transition-colors duration-200 ${
                    location.pathname === link.url
                      ? "text-green"
                      : "text-gray-700"
                  }`}
                >
                  <Link to={link.url} onClick={() => setIsOpen(false)}>
                    {link.title}
                  </Link>
                </Motion.div>
              ))}
            </div>
            <Motion.div
              variants={socialVariants}
              className='pb-8 justify-center space-x-6 flex'
            >
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-black hover:text-green transition-colors duration-200 flex items-center gap-2'
                >
                  {social.icon}
                </a>
              ))}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
