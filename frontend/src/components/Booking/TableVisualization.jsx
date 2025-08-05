/* eslint-disable no-case-declarations */
import React from 'react'

const TableVisualization = ({ table, selectedSeats, onSeatClick }) => {
      const isRoundTable = !["5", "7", "8", "10"].includes(
        table.number.toString()
      );
      const tableWidth = isRoundTable ? "w-22 h-22" : "w-38 h-20";
      const tableClass = isRoundTable ? "rounded-full" : "rounded-lg";

    const getSeatPosition = (index, totalSeats, isRound) => {
      if (isRound) {
        // Circular arrangement for round tables
        const angle = (index * 360) / totalSeats;
        const radius = 64;
        return {
          x: Math.cos((angle * Math.PI) / 180) * radius,
          y: Math.sin((angle * Math.PI) / 180) * radius,
        };
      } else {
        // Rectangular table seating arrangements
        switch (totalSeats) {
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
              { x: -40, y: -45 },
              { x: 40, y: -45 }, // Top
              { x: -60, y: 0 }, // Left
              { x: 60, y: 0 }, // Right
              { x: -40, y: 45 },
              { x: 40, y: 45 }, // Bottom
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
              { x: -40, y: -45 },
              { x: 10, y: -45 },
              { x: 62, y: -45 }, // Top
              { x: -76, y: 10 }, // Left
              { x: 108, y: 10 }, // Right
              { x: -40, y: 78 },
              { x: 10, y: 78 },
              { x: 64, y: 78 }, // Bottom
            ][index];
          case 10:
            // 4 top, 1 left, 1 right, 4 bottom
            return [
              { x: -60, y: -45 },
              { x: -20, y: -45 },
              { x: 20, y: -45 },
              { x: 60, y: -45 }, // Top
              { x: -70, y: 0 }, // Left
              { x: 70, y: 0 }, // Right
              { x: -60, y: 45 },
              { x: -20, y: 45 },
              { x: 20, y: 45 },
              { x: 60, y: 45 }, // Bottom
            ][index];
          default:
            // Default to circular if unexpected seat count
            const angle = (index * 360) / totalSeats;
            const radius = 64;
            return {
              x: Math.cos((angle * Math.PI) / 180) * radius,
              y: Math.sin((angle * Math.PI) / 180) * radius,
            };
        }
      }
    };
  return (
    <div className='relative mb-12 flex justify-center'>
      {/* Table */}
      <div
        className={`${tableWidth} ${tableClass} border-4 border-gray-500 bg-gray-700/50 flex items-center justify-center relative`}
      >
        <span className='text-white font-bold'>Table {table.number}</span>

        {/* Seats arranged around the table */}
        {Array.from({ length: table.totalSeats }, (_, i) => i + 1).map(
          (seatNumber, index) => {
            const isBooked = table.bookedSeats.includes(seatNumber);
            const isSelected = selectedSeats.includes(seatNumber);
             const { x, y } = getSeatPosition(
               index,
               table.totalSeats,
               isRoundTable
             );
            // const angle = (index * 360) / table.totalSeats;
            // const radius = isRoundTable ? 64 : index % 2 === 0 ? 70 : 50; // Alternate for rectangular tables

            // // Position calculation
            // const x = Math.cos((angle * Math.PI) / 180) * radius;
            // const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <div
                key={seatNumber}
                className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 ${
                  isBooked
                    ? "bg-red-800 border-red-600 text-red-300 cursor-not-allowed"
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
                onClick={() => !isBooked && onSeatClick(seatNumber)}
              >
                {seatNumber}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default TableVisualization