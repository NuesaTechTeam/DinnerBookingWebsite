import React from 'react';
import { formatTierText } from '../../lib/helpers.jsx';

const getSeatLabel = (seatNumber) => {
  const match = String(seatNumber || '').match(/S(\d+)$/);
  return match ? match[1] : seatNumber;
};

const SeatArrangement = ({
  table,
  bookedSeats = [],
  lockedSeats = [],
  onSeatClick,
  getSeatStatusClass,
}) => {
  const seats = Array.isArray(table?.seats) ? table.seats : [];
  const label = formatTierText(table?.tableNumber);
  const isRound = table?.shape === 'ROUND';

  const renderSeat = (seat) => {
    const booked = seat.isBooked || bookedSeats.includes(seat._id);
    const locked = !booked && lockedSeats.includes(seat._id);
    return (
      <button
        key={seat._id}
        type="button"
        onClick={() => onSeatClick(seat)}
        disabled={booked || locked}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${getSeatStatusClass(
          seat
        )}`}
      >
        {getSeatLabel(seat.seatNumber)}
      </button>
    );
  };

  if (seats.length === 0) {
    return <p className="text-xs text-gray-500 font-light">No seats for this table.</p>;
  }

  // Round table: seats arranged in a circle around the table
  if (isRound) {
    const count = seats.length;
    const radius = count <= 4 ? 34 : 37;

    return (
      <div className="relative mx-auto w-60 h-60 sm:w-72 sm:h-72">
        {/* Round table */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#d4af37]/60 bg-gradient-to-br from-[#1a1508] to-[#0a0a0a] shadow-[0_0_25px_rgba(212,175,55,0.25)] flex items-center justify-center">
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-[#d4af37]/90 text-center px-2">
            {label}
          </span>
        </div>

        {seats.map((seat, index) => {
          const angle = (360 / count) * index - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + radius * Math.cos(rad);
          const y = 50 + radius * Math.sin(rad);

          return (
            <div
              key={seat._id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {renderSeat(seat)}
            </div>
          );
        })}
      </div>
    );
  }

  // Banquet / long table: seats along the top and bottom of the table
  const topCount = Math.ceil(seats.length / 2);
  const topSeats = seats.slice(0, topCount);
  const bottomSeats = seats.slice(topCount);

  return (
    <div className="mx-auto w-full flex flex-col items-center gap-3 sm:gap-4">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {topSeats.map(renderSeat)}
      </div>

      {/* Banquet table */}
      <div className="w-48 sm:w-64 h-16 sm:h-20 rounded-xl border-2 border-[#d4af37]/60 bg-gradient-to-br from-[#1a1508] to-[#0a0a0a] shadow-[0_0_25px_rgba(212,175,55,0.25)] flex items-center justify-center">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-[#d4af37]/90">
          {label}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {bottomSeats.map(renderSeat)}
      </div>
    </div>
  );
};

export default SeatArrangement;
