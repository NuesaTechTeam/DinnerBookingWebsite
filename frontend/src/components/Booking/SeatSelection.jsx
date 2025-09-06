import React from "react";
import PropTypes from "prop-types";
import {
  extractSeatNumber,
  getSectionColor,
  getSectionIcon,
  getSectionPrice,
} from "../../lib/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../context/modal/useToast";
import HeaderBooking from "./HeaderBooking";
import { Crown, Shield, Star, Users } from "lucide-react";
import TableVisualization from "./TableVisualization";
import SeatComponent from "./SeatComponent";
import TableComponent from "./TableComponent";
import LoadingScreen from "../LoadingScreen";

const SeatSelection = ({
  selectedTable,
  setSelectedTable,
  selectedSeats,
  setSelectedSeats,
  setShowCheckout,
  tablesData = {},
  bookedSeats,
  lockedSeats,
  checkAvailability,
  isChecking,
  totalAmount,
  setSeatNames,
}) => {
  const { showToast, TOAST_TYPES } = useToast();
  const queryClient = useQueryClient();

  const assignSideToTable = (table, index, totalTablesInSection) => {
    const half = Math.ceil(totalTablesInSection / 2);
    return {
      ...table,
      side: index < half ? "left" : "right",
    };
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setSelectedSeats([]);
    setSeatNames([])
  };

  const handleSeatClick = (seat) => {
    const seatId = seat._id
    const seatName = seat.seatNumber
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
    setSeatNames((prev) =>
      prev.includes(seatName)
        ? prev.filter((s) => s !== seatName)
        : [...prev, seatName]
    );
  };

  const renderTableSection = (sectionTables, side) => {
    // Add side property to tables if not present
    const tablesWithSides = sectionTables?.map((table, index) =>
      assignSideToTable(table, index, sectionTables.length)
    );

    return tablesWithSides
      ?.filter((table) => table.side === side)
      .map((table) => (
        <div key={table._id} className="group">
          <TableComponent
            table={table}
            onTableClick={handleTableClick}
            isSelected={selectedTable?._id === table._id}
          />
        </div>
      ));
  };

  const handleReserveButton = () => {
    checkAvailability(selectedSeats, {
      onSuccess: (data) => {
        if (data.success && data.available) {
          setShowCheckout(true);
        } else {
          showToast(
            `Some seats are no longer available: ${data.unavailableSeats?.join(
              ", "
            )}`,
            TOAST_TYPES.ERROR
          );
          queryClient.invalidateQueries(["seatStatus", selectedTable._id]);
          window.location.reload();
        }
      },
    });
  };


  if (!tablesData || Object.keys(tablesData).length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="">
      {/* Header */}
      <HeaderBooking />
      <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Seating Layout */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-red-900/30 rounded-lg p-6 max-sm:px-1">
              {/* Stage */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-8 rounded-lg inline-block border border-blue-400/50">
                  <h2 className="text-2xl font-bold tracking-wider">STAGE</h2>
                </div>
              </div>

              {/* Seating Layout */}
              <div className="space-y-2 relative">
                {/* Upper Hall - VVIP and VIP */}
                <div className="space-y-1">
                  {/* VVIP Section */}
                  <div className="relative z-4">
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-white py-2 px-6 rounded-full inline-block border border-yellow-400/50">
                        <div className="flex items-center space-x-2">
                          <Crown size={16} />
                          <span className="font-bold">VVIP</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="grid grid-cols-4 space-x-1">
                        {renderTableSection(tablesData?.VVIP, "left")}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {renderTableSection(tablesData?.VVIP, "right")}
                      </div>
                    </div>
                  </div>

                  {/* VIP Section */}
                  <div className="relative z-4">
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-2 px-6 rounded-full inline-block border border-red-400/50">
                        <div className="flex items-center space-x-2">
                          <Star size={16} />
                          <span className="font-bold">VIP</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-16">
                      <div className="grid grid-cols-3 gap-2">
                        {renderTableSection(tablesData?.VIP, "left")}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {renderTableSection(tablesData?.VIP, "right")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Red Carpet Divider */}
                <div className="relative py-0 px-6 my-0">
                  <div className="absolute inset-y-0 top-80 left-[47%] md:left-[49%] flex items-center justify-center">
                    <div className="h-270 w-6 bg-gradient-to-b from-red-800 via-red-600 to-red-800 rounded-full border border-red-400/50"></div>
                  </div>
                  <div className="relative flex justify-center items-center h-12">
                    <span className="bg-black px-2 py-2.5 md:py-4 md:px-3 text-red-400 text-sm font-bold tracking-wider border border-red-600/50 rounded rotate-90 whitespace-nowrap">
                      RED CARPET
                    </span>
                  </div>
                </div>

                {/* Lower Hall - Silver and Regular */}
                <div className="space-y-2">
                  {/* Silver Section */}
                  <div className="relative z-4">
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white py-2 px-6 rounded-full inline-block border border-gray-300/50">
                        <div className="flex items-center space-x-2">
                          <Shield size={16} />
                          <span className="font-bold">SILVER</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-16">
                      <div className="grid grid-cols-3 gap-2">
                        {renderTableSection(tablesData?.SILVER, "left")}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {renderTableSection(tablesData?.SILVER, "right")}
                      </div>
                    </div>
                  </div>

                  {/* Regular Section */}
                  <div className="relative z-4">
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2 px-6 rounded-full inline-block border border-amber-600/50">
                        <div className="flex items-center space-x-2">
                          <Users size={16} />
                          <span className="font-bold">REGULAR</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 ">
                      <div className="grid grid-cols-4 space-x-1 space-y-8">
                        {renderTableSection(tablesData?.REGULAR, "left")}
                      </div>
                      <div className="grid grid-cols-4 space-x-1 space-y-8">
                        {renderTableSection(tablesData?.REGULAR, "right")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-12 max-sm:mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold mb-4 text-center">LEGEND</h3>
                <div className="flex justify-center flex-wrap space-x-4 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-400"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-800 border border-red-600"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-800 border border-yellow-600"></div>
                    <span>Locked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-600 border to-green-800 border-green-400"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-red-900/30 rounded-lg p-6 sticky top-24">
              {!selectedTable ? (
                <div className="text-center">
                  <Crown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Select Your Table</h3>
                  <p className="text-gray-400 mb-6">
                    Choose a table to view available seats and make your
                    reservation
                  </p>

                  <div className="space-y-4">
                    {tablesData && ["VVIP", "VIP", "SILVER", "REGULAR"].map((type) => {
                      const availableTables = tablesData[type]?.filter(
                        (t) => t.bookedSeats.length < t.capacity
                      ).length;
                      return (
                        <div
                          key={type}
                          className={`bg-gradient-to-r ${getSectionColor(
                            type
                          )} p-4 rounded border border-white/20`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getSectionIcon(type)}
                              <span className="font-bold uppercase">
                                {type}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                {getSectionPrice(type)}
                              </div>
                              <div className="text-sm opacity-80">
                                {availableTables} tables available
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">
                        Table {selectedTable.tableNumber}
                      </h3>
                      <p className="text-gray-400 uppercase">
                        {selectedTable.type} Section
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-400">
                        {getSectionPrice(selectedTable.type)}
                      </div>
                      <div className="text-sm text-gray-400">per person</div>
                    </div>
                  </div>

                  {/* Seat Selection */}
                  <div className="mb-6">
                    <h4 className="font-bold mb-10">Select Seats</h4>
                    <TableVisualization
                      table={selectedTable}
                      selectedSeats={selectedSeats}
                      onSeatClick={handleSeatClick}
                      bookedSeats={bookedSeats}
                      lockedSeats={lockedSeats}
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {selectedTable.seats.map((seat) => (
                        <SeatComponent
                          key={seat._id}
                          seat={seat}
                          seatNumber={extractSeatNumber(seat.seatNumber)}
                          isBooked={selectedTable.bookedSeats.includes(
                            seat.seatNumber
                          )}
                          isSelected={selectedSeats.includes(seat._id)}
                          isLocked={lockedSeats.includes(seat._id)}
                          isBookedNow={bookedSeats.includes(seat._id)}
                          onSeatClick={handleSeatClick}
                        />
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      {selectedSeats.length} seat(s) selected
                    </div>
                  </div>

                  {/* Total */}
                  {selectedSeats.length > 0 && (
                    <div className="border-t border-gray-700 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">
                          Total ({selectedSeats.length} seats)
                        </span>
                        <span className="text-2xl font-bold text-red-400">
                          ₦{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleReserveButton}
                      className={`w-full py-3 rounded font-bold transition-all cursor-pointer duration-300 ${
                        selectedSeats.length > 0
                          ? "bg-gradient-to-r from-red-600 to-red-800 text-white border border-red-400/50 hover:shadow-lg"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={selectedSeats.length === 0 || isChecking}
                    >
                      {isChecking
                        ? "Checking availability..."
                        : `RESERVE ${selectedSeats.length} SEATS(S)`}
                      RESERVE SEATS
                    </button>
                    <button
                      className="w-full cursor-pointer py-3 border border-gray-600 text-gray-300 rounded font-bold hover:bg-gray-800 transition-all duration-300"
                      onClick={() => setSelectedTable(null)}
                    >
                      BACK TO TABLES
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SeatSelection.propTypes = {};

export default SeatSelection;
