import { Crown, Shield, Star, User } from 'lucide-react';
import React from 'react';
import { getTierLabel } from '../../lib/helpers.jsx';

const TableComponent = ({ table, onTableClick, isSelected }) => {
  const availableSeats = table.capacity - table.bookedSeats.length;
  const isFullyBooked = availableSeats === 0;

  const getSectionColor = (type) => {
    switch (type) {
      case "VVIP":
        return "from-[#bf953f] via-[#fcf6ba] to-[#aa7c11]";
      case "VIP":
        return "from-[#b38728] to-[#fbf5b7]";
      case "SILVER":
        return "from-slate-300 via-slate-100 to-slate-400";
      default:
        return "from-[#4a3b10] to-[#1f1807]";
    }
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case "VVIP":
        return <Crown className="w-3 h-3 md:w-5 md:h-5 text-black" size={12} />;
      case "VIP":
        return <Star className="w-3 h-3 md:w-5 md:h-5 text-black" size={12} />;
      case "SILVER":
        return <Shield className="w-3 h-3 md:w-5 md:h-5 text-slate-900" size={12} />;
      default:
        return <User className="w-3 h-3 md:w-5 md:h-5 text-[#d4af37]" size={12} />;
    }
  };

  const extractTableNumber = (tableNumber) => {
    const parts = tableNumber.split("-");
    return parts[parts.length - 1];
  };

  const tableNum = extractTableNumber(table.tableNumber);

  const hideSeat =
    table.type === "REGULAR" &&
    ((tableNum > 28 && tableNum < 43) || (tableNum > 70 && tableNum < 85));

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-110 group ${
        isSelected ? "scale-110 z-10" : ""
      } ${hideSeat ? "hidden" : ""}`}
      onClick={() => !isFullyBooked && onTableClick(table)}
    >
      {/* Table Main Circle */}
      <div
        className={`w-8 h-8 md:w-16 md:h-16 rounded-full border-1 md:border-2 flex items-center justify-center font-serif font-bold text-xs md:text-sm transition-all duration-300 ${
          isFullyBooked
            ? "bg-[#121212] border-gray-800 text-gray-600 cursor-not-allowed opacity-40"
            : isSelected
            ? `bg-gradient-to-br ${getSectionColor(
                table.type
              )} text-black border-[#fcf6ba] shadow-[0_0_20px_rgba(212,175,55,0.7)]`
            : `bg-gradient-to-br ${getSectionColor(
                table.type
              )} text-black border-[#d4af37]/60 hover:border-[#fcf6ba] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]`
        }`}
      >
        {extractTableNumber(table.tableNumber)}
      </div>

      {/* Table Info Tooltip */}
      <div
        className={`absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[#09090b] border border-[#d4af37]/40 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all duration-300 z-20 shadow-xl ${
          isSelected
            ? "opacity-100 visible"
            : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
        }`}
      >
        <div className="flex items-center space-x-1 font-semibold">
          {getSectionIcon(table.type)}
          <span className="text-[#d4af37]">{getTierLabel(table.type)} Table {extractTableNumber(table.tableNumber)}</span>
        </div>
        <div className="text-emerald-400 text-[11px]">
          {availableSeats}/{table.capacity} available
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#09090b]"></div>
      </div>

      {/* Section Badge */}
      <div
        className={`absolute -top-1.5 md:-top-2 -right-1.5 md:-right-2 w-5 h-5 md:w-7 md:h-7 rounded-full bg-gradient-to-br z-10 ${getSectionColor(
          table.type
        )} border border-[#d4af37] flex items-center justify-center shadow-md`}
      >
        {getSectionIcon(table.type)}
      </div>
    </div>
  );
};

export default TableComponent;