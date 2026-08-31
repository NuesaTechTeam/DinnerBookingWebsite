import React from 'react';

const SeatComponent = ({ seat, seatNumber, isBooked, isSelected, onSeatClick, isLocked, isBookedNow }) => {
  return (
    <div
      className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-200 select-none ${
        isBooked || isBookedNow
          ? "bg-red-950/80 border-red-800/60 text-red-400/50 cursor-not-allowed"
          : isLocked
          ? "bg-amber-950/80 border-amber-700/60 text-amber-500 cursor-not-allowed"
          : isSelected
          ? "bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] border-[#fcf6ba] text-black font-extrabold shadow-[0_0_12px_rgba(212,175,55,0.6)] transform scale-110 cursor-pointer"
          : "bg-black/60 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37] hover:scale-105 cursor-pointer"
      }`}
      onClick={() =>
        (!isBooked && !isBookedNow && !isLocked) && onSeatClick(seat)
      }
    >
      {seatNumber}
    </div>
  );
};

export default SeatComponent;