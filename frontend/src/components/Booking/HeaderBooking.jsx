import { Calendar, ChevronLeft, Clock, MapPin } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const HeaderBooking = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(-1);
  };

  return (
    <header className="bg-[#09090b]/95 backdrop-blur-md border-b border-[#d4af37]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClick}
              className="text-gray-400 hover:text-[#d4af37] transition-colors p-1 rounded-lg hover:bg-[#141414] cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] tracking-wider uppercase">
                FÀÁJÍ LAWA
              </h1>
              <p className="text-xs text-[#d4af37]/80 tracking-widest uppercase font-light">
                Table Reservations
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-xs text-gray-300 tracking-wider">
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#d4af37]/20 px-3 py-1.5 rounded-full">
              <Calendar className="text-[#d4af37]" size={14} />
              <span>31ST OCTOBER, 2026</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#d4af37]/20 px-3 py-1.5 rounded-full">
              <Clock className="text-[#d4af37]" size={14} />
              <span>5:00 PM</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#d4af37]/20 px-3 py-1.5 rounded-full">
              <MapPin className="text-[#d4af37]" size={14} />
              <span>Alfa Belgore Hall</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBooking;