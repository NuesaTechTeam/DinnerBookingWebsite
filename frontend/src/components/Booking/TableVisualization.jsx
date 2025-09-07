/* eslint-disable no-case-declarations */
import React from "react";

const TableVisualization = ({
  table,
  selectedSeats,
  onSeatClick,
  bookedSeats,
  lockedSeats,
}) => {
  const isRoundTable = table.shape === "ROUND";
  const tableWidth = isRoundTable ? "w-22 h-22" : "w-20 h-38";
  const tableClass = isRoundTable ? "rounded-full" : "rounded-lg";

  const getSeatPosition = (index, capacity, isRound) => {
    if (isRound) {
      // Circular arrangement for round tables
      const angle = (index * 360) / capacity;
      const radius = 64;
      return {
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
      };
    } else {
      // Rectangular table seating arrangements
      switch (capacity) {
        case 5:
          // 2 top, 1 right, 2 bottom
          return [
            { x: -40, y: -45 },
            { x: 40, y: -45 }, // Top
            { x: 60, y: 0 }, // Right
            { x: -40, y: 45 },
            { x: 40, y: 45 }, // Bottom
          ][index];
        case 6:
          // 2 top, 1 left, 1 right, 2 bottom
          return [
            { x: -45, y: -30 },
            { x: -45, y: 30 }, // Left
            { x: 0, y: -60 }, // Top
            { x: 0, y: 60 }, // Bottom
            { x: 45, y: -30 },
            { x: 45, y: 30 },
          ][index];
        case 7:
          // 3 top, 1 left, 1 right, 2 bottom
          return [
            { x: -50, y: -45 },
            { x: 0, y: -45 },
            { x: 50, y: -45 }, // Top
            { x: -60, y: 0 }, // Left
            { x: 60, y: 0 }, // Right
            { x: -40, y: 45 },
            { x: 40, y: 45 }, // Bottom
          ][index];
        case 8:
          // 3 top, 1 left, 1 right, 3 bottom
          return [
            { x: -45, y: -40 },//left
            { x: -45, y: 10 },
            { x: -45, y: 62 }, 
            { x: 14, y: -78 }, // top
            { x: 14, y: 110 }, // bottom
            { x: 78, y: -40 },// right
            { x: 78, y: 10 },
            { x: 78, y: 64 }, 
          ][index];
        case 10:
          // 4 top, 1 left, 1 right, 4 bottom
          return [
            { x: -45, y: -60 },
            { x: -45, y: -20 },
            { x: -45, y: 20 },
            { x: -45, y: 60 }, // Left
            { x: 0, y: -70 }, // Top
            { x: 0, y: 70 }, // Bottom
            { x: 45, y: -60 },
            { x: 45, y: -20 },
            { x: 45, y: 20 },
            { x: 45, y: 60 }, // Bottom
          ][index];
        default:
          // Default to circular if unexpected seat count
          const angle = (index * 360) / capacity;
          const radius = 64;
          return {
            x: Math.cos((angle * Math.PI) / 180) * radius,
            y: Math.sin((angle * Math.PI) / 180) * radius,
          };
      }
    }
  };

  const extractTableNumber = (tableNumber) => {
    const parts = tableNumber.split("-");
    return parts[parts.length - 1];
  };

  const extractSeatNumber = (seatNumber) => {
    const match = seatNumber.match(/S(\d+)$/);
    return match ? parseInt(match[1]) : null;
  };
  return (
    <div className="relative mb-12 flex justify-center">
      {/* Table */}
      <div
        className={`${tableWidth} ${tableClass} border-4 border-gray-500 bg-gray-700/50 flex items-center justify-center relative`}
      >
        <span className="text-white font-bold">
          Table {extractTableNumber(table.tableNumber)}
        </span>

        {/* Seats arranged around the table */}
        {table.seats.map((seat, index) => {
          const isBooked = table.bookedSeats.includes(seat.seatNumber);
          const isSelected = selectedSeats.includes(seat._id);
          const isLocked = lockedSeats.includes(seat._id);
          const isBookedNow = bookedSeats.includes(seat._id);
          const { x, y } = getSeatPosition(index, table.capacity, isRoundTable);
          // const angle = (index * 360) / table.capacity;
          // const radius = isRoundTable ? 64 : index % 2 === 0 ? 70 : 50; // Alternate for rectangular tables

          // // Position calculation
          // const x = Math.cos((angle * Math.PI) / 180) * radius;
          // const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={seat._id}
              className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 ${
                isBooked || isBookedNow
                  ? "bg-red-800 border-red-600 text-red-300 cursor-not-allowed"
                  : isLocked
                  ? "bg-yellow-800 border-yellow-600 text-yellow-300 cursor-not-allowed"
                  : isSelected
                  ? "bg-green-600 border-green-400 text-white transform scale-110"
                  : "bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600 hover:border-gray-400"
              }`}
              style={{
                left: `calc(${isRoundTable ? "68%" : "50%"} + ${x}px - 1rem)`,
                top: `calc(${isRoundTable ? "68%" : "50%"} + ${y}px - 1rem)`,
                transform: isSelected
                  ? "translate(-50%, -50%) scale(1.1)"
                  : "translate(-50%, -50%)",
              }}
              onClick={() =>
                (!isBooked && !isBookedNow && !isLocked) && onSeatClick(seat)
              }
            >
              {extractSeatNumber(seat.seatNumber)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableVisualization;
