import { Crown, Shield, Star, User, Users } from 'lucide-react';
import React from 'react'

const TableComponent = ({ table, onTableClick, isSelected }) => {
        const availableSeats = table.capacity - table.bookedSeats.length;
    const isFullyBooked = availableSeats === 0;
    
      const getSectionColor = (type) => {
        switch (type) {
          case "VVIP":
            return "from-yellow-600 to-yellow-800";
          case "VIP":
            return "from-red-600 to-red-800";
          case "SILVER":
            return "from-gray-400 to-gray-600";
          default:
            return "from-amber-700 to-amber-900";
        }
    };
    
      const getSectionIcon = (type) => {
        switch (type) {
          case "VVIP":
            return <Crown className='w-3 h-3 md:w-5 md:h-5'  size = {12} />;
          case "VIP":
            return <Star className='w-3 h-3 md:w-5 md:h-5' size={12} />;
          case "SILVER":
            return <Shield className='w-3 h-3 md:w-5 md:h-5' size={12} />;
          default:
            return <User className='w-3 h-3 md:w-5 md:h-5' size={12} />;
        }
      };

       const extractTableNumber = (tableNumber) => {
        const parts = tableNumber.split("-");
        return parts[parts.length - 1];
      };
  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-110 ${
        isSelected ? "scale-110 z-10" : ""
      }`}
      onClick={() => !isFullyBooked && onTableClick(table)}
    >
      {/* Table */}
      <div
        className={`w-8 h-8 md:w-16 md:h-16 rounded-full border-1 md:border-4 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
          isFullyBooked
            ? "bg-gray-800 border-gray-600 cursor-not-allowed opacity-50"
            : isSelected
            ? `bg-gradient-to-br ${getSectionColor(
                table.type
              )} border-white shadow-lg shadow-red-500/30`
            : `bg-gradient-to-br ${getSectionColor(
                table.type
              )} border-gray-300 hover:border-white hover:shadow-lg`
        }`}
      >
        {extractTableNumber(table.tableNumber)}
      </div>

      {/* Table Info Tooltip */}
      <div
        className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-1 rounded text-xs whitespace-nowrap transition-all duration-300 z-10 ${
          isSelected
            ? "opacity-100 visible"
            : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
        }`}
      >
        <div className='flex items-center space-x-1'>
          {getSectionIcon(table.type)}
          <span>Table {table.tableNumber}</span>
        </div>
        <div className='text-green-400'>
          {availableSeats}/{table.capacity} available
        </div>
        <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90'></div>
      </div>

      {/* Section Badge */}
      <div
        className={`absolute -top-4.5 md:-top-6 -right-2 md:right-12 w-5 h-5 md:w-8 md:h-8 rounded-full bg-gradient-to-br z-2 ${getSectionColor(
          table.type
        )} border-1 md:border-2 border-white flex items-center justify-center`}
      >
        {getSectionIcon(table.type)}
      </div>
    </div>
  );
};

export default TableComponent