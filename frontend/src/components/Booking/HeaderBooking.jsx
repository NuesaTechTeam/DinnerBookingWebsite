import { Calendar, ChevronLeft, Clock, MapPin } from "lucide-react";
import React from "react";
import {  useNavigate } from "react-router-dom";

const HeaderBooking = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(-1);
  };
  return (
    <header className='bg-black/95 backdrop-blur-md border-b border-red-900/30 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <div className='flex items-center space-x-4'>
            <button className='text-gray-400 hover:text-white transition-colors'>
              <ChevronLeft
                className='w-6 h-6'
                size={18}
                onClick={handleClick}
              />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-white tracking-wider'>
                CASABLANCA
              </h1>
              <p className='text-sm text-red-400'>Table Reservations</p>
            </div>
          </div>
          <div className='hidden md:flex items-center space-x-6 text-sm'>
            <div className='flex items-center space-x-2'>
              <Calendar className='text-red-400' size={14} />
              <span>November 15, 2025</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Clock className=' text-red-400' size={14} />
              <span>7:00 PM</span>
            </div>
            <div className='flex items-center space-x-2'>
              <MapPin className=' text-red-400' size={14} />
              <span>Alfa Belgore Hall</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBooking;
