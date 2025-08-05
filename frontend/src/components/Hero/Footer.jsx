import { BsInstagram, BsSnapchat, BsTwitterX } from "react-icons/bs";
// import { Link } from "react-router-dom";
import Link from "../Link.jsx";
import logo from "../../assets/logo.png";
import {MapPin, Phone, Mail} from "lucide-react"


const Footer = () => {
  return (
    <footer
      id='contact'
      className='bg-black border-t border-red-900/50 text-white py-16 max-sm:py-12'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='col-span-2'>
            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 border-2 border-white/20 flex items-center justify-center'>
                <img src={logo} alt='logo' className='w-8 h-8' />
              </div>
              <div>
                <h3 className='text-2xl font-bold tracking-wider'>
                  CASABLANCA
                </h3>
                <p className='text-red-400 font-medium'>
                  Honor • Legacy • Ambition
                </p>
              </div>
            </div>
            <p className='text-gray-300 mb-6 max-w-md font-light'>
              Where legends gather, where respect is earned, and where every
              evening becomes a story worth telling. Welcome to the famiglia.
            </p>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='w-12 h-12 bg-red-600 border border-red-400/50 flex items-center justify-center hover:bg-red-500 transition-colors'
              >
                <BsInstagram size={18} />
              </a>
              <a
                href='#'
                className='w-12 h-12 bg-red-600 border border-red-400/50 flex items-center justify-center hover:bg-red-500 transition-colors'
              >
                <BsSnapchat size={18} />
              </a>
              <a
                href='#'
                className='w-12 h-12 bg-red-600 border border-red-400/50 flex items-center justify-center hover:bg-red-500 transition-colors'
              >
                <BsTwitterX size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className='text-lg font-bold mb-4 tracking-wide'>NAVIGATION</h4>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#home'
                  className='text-gray-300 hover:text-red-400 transition-colors font-light'
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href='#packages'
                  className='text-gray-300 hover:text-red-400 transition-colors font-light'
                >
                  Packages
                </a>
              </li>
              <li>
                <a
                  href='#famiglia'
                  className='text-gray-300 hover:text-red-400 transition-colors font-light'
                >
                  La Famiglia
                </a>
              </li>
              <li>
                <a
                  href='#contact'
                  className='text-gray-300 hover:text-red-400 transition-colors font-light'
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='text-lg font-bold mb-4 tracking-wide'>CONTACT</h4>
            <div className='space-y-3'>
              <div className='flex items-center text-gray-300'>
                <MapPin className='w-4 h-4 mr-2 text-red-400' />
                <span className='text-sm font-light'>
                  ABUAD, Ado-Ekiti, Nigeria
                </span>
              </div>
              <div className='flex items-center text-gray-300'>
                <Phone className='w-4 h-4 mr-2 text-red-400' />
                <span className='text-sm font-light'>
                  +234 (0) 123 456 7890
                </span>
              </div>
              <div className='flex items-center text-gray-300'>
                <Mail className='w-4 h-4 mr-2 text-red-400' />
                <span className='text-sm font-light'>don@casablanca.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-red-900/50 mt-12 pt-8 text-center'>
          <p className='text-gray-400 font-light'>
            © 2025 Casablanca. Proudly presented by NUESA ABUAD. All rights
            reserved.
          </p>
          <p className='text-red-400 text-sm mt-2 italic'>
            "Respect is earned, honor is given, but legends... legends are made
            at Casablanca."
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
