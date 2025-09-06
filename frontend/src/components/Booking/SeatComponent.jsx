import React from 'react'

const SeatComponent = ({seat, seatNumber, isBooked, isSelected, onSeatClick, isLocked, isBookedNow }) => {
  return (
    <div
      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 ${
        isBooked || isBookedNow
          ? "bg-red-800 border-red-600 text-red-300 cursor-not-allowed"
          : isLocked
          ? "bg-yellow-800 border-yellow-600 text-yellow-300 cursor-not-allowed"
          : isSelected
          ? "bg-green-600 border-green-400 text-white transform scale-110"
          : "bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600 hover:border-gray-400"
      }`}
      onClick={() =>
        (!isBooked && !isBookedNow && !isLocked) && onSeatClick(seat)
      }
    >
      {seatNumber}
    </div>
  );
};

export default SeatComponent