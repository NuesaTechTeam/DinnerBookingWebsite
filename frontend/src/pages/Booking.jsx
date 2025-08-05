/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { HeaderBooking, SeatComponent, TableComponent, TableVisualization, CheckoutForm } from '../components/Booking'
import { tables} from '../lib/constants';
import { Crown, Shield, Star, Users } from 'lucide-react';
import {motion as AnimatePresence} from "framer-motion"

const Booking = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStep, setBookingStep] = useState("select"); // select, confirm, complete
  const [tablesData, setTablesData] = useState(tables)
  const [showCheckout, setShowCheckout] = useState(false)

  const assignSideToTable = (table, index, totalTablesInSection) => {
    const half = Math.ceil(totalTablesInSection / 2);
    return {
      ...table,
      side: index < half ? "left" : "right",
    };
  };

    const getSectionPrice = (section) => {
      switch (section) {
        case "vvip":
          return "₦40,000";
        case "vip":
          return "₦25,000";
        case "silver":
          return "₦18,000";
        default:
          return "₦8,000";
      }
  };

        const getSectionColor = (section) => {
          switch (section) {
            case "vvip":
              return "from-yellow-600 to-yellow-800";
            case "vip":
              return "from-red-600 to-red-800";
            case "silver":
              return "from-gray-400 to-gray-600";
            default:
              return "from-amber-700 to-amber-900";
          }
        };

        const getSectionIcon = (section) => {
          switch (section) {
            case "vvip":
              return <Crown size={14} />;
            case "vip":
              return <Star size={14} />;
            case "silver":
              return <Shield size={14} />;
            default:
              return <Users size={14} />;
          }
        };
  
  const handleTableClick = (table) => {
    setSelectedTable(table);
    setSelectedSeats([]);
  };

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const renderTableSection = (sectionTables, side) => {
    // Add side property to tables if not present
    const tablesWithSides = sectionTables.map((table, index) =>
      assignSideToTable(table, index, sectionTables.length)
    );

    return tablesWithSides
      .filter((table) => table.side === side)
      .map((table) => (
        <div key={table.id} className='group'>
          <TableComponent
            table={table}
            onTableClick={handleTableClick}
            isSelected={selectedTable?.id === table.id}
          />
        </div>
      ));
  };

  const allTables = [
    ...tablesData.vvip,
    ...tablesData.vip,
    ...tablesData.silver,
    ...tablesData.regular,
  ];


  return (
    <div className='min-h-screen bg-black text-white overflow-x-hidden'>
      {/* Header */}
      <HeaderBooking />
      <div className='max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 py-8'>
        <div className='grid lg:grid-cols-4 gap-4'>
          {/* Main Seating Layout */}
          <div className='lg:col-span-3'>
            <div className='bg-gray-900 border border-red-900/30 rounded-lg p-6 max-sm:px-1'>
              {/* Stage */}
              <div className='text-center mb-8'>
                <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-8 rounded-lg inline-block border border-blue-400/50'>
                  <h2 className='text-2xl font-bold tracking-wider'>STAGE</h2>
                </div>
              </div>

              {/* Seating Layout */}
              <div className='space-y-2 relative'>
                {/* Upper Hall - VVIP and VIP */}
                <div className='space-y-1'>
                  {/* VVIP Section */}
                  <div className='relative z-4'>
                    <div className='text-center mb-8'>
                      <div className='bg-gradient-to-r from-yellow-600 to-yellow-800 text-white py-2 px-6 rounded-full inline-block border border-yellow-400/50'>
                        <div className='flex items-center space-x-2'>
                          <Crown size={16} />
                          <span className='font-bold'>VVIP</span>
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-10'>
                      <div className='grid grid-cols-4 space-x-1'>
                        {renderTableSection(tablesData.vvip, "left")}
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        {renderTableSection(tablesData.vvip, "right")}
                      </div>
                    </div>
                  </div>

                  {/* VIP Section */}
                  <div className='relative z-4'>
                    <div className='text-center mb-8'>
                      <div className='bg-gradient-to-r from-red-600 to-red-800 text-white py-2 px-6 rounded-full inline-block border border-red-400/50'>
                        <div className='flex items-center space-x-2'>
                          <Star size={16} />
                          <span className='font-bold'>VIP</span>
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-16'>
                      <div className='grid grid-cols-3 gap-2'>
                        {renderTableSection(tablesData.vip, "left")}
                      </div>
                      <div className='grid grid-cols-3 gap-2'>
                        {renderTableSection(tablesData.vip, "right")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Red Carpet Divider */}
                <div className='relative py-0 px-6 my-0'>
                  <div className='absolute inset-y-0 left-[47%] md:left-[49%] flex items-center justify-center'>
                    <div className='h-130 w-6 bg-gradient-to-b from-red-800 via-red-600 to-red-800 rounded-full border border-red-400/50'></div>
                  </div>
                  <div className='relative flex justify-center items-center h-12'>
                    <span className='bg-black px-2 py-2.5 md:py-4 md:px-3 text-red-400 text-sm font-bold tracking-wider border border-red-600/50 rounded rotate-90 whitespace-nowrap'>
                      RED CARPET
                    </span>
                  </div>
                </div>

                {/* Lower Hall - Silver and Regular */}
                <div className='space-y-2'>
                  {/* Silver Section */}
                  <div className='relative z-4'>
                    <div className='text-center mb-8'>
                      <div className='bg-gradient-to-r from-gray-400 to-gray-600 text-white py-2 px-6 rounded-full inline-block border border-gray-300/50'>
                        <div className='flex items-center space-x-2'>
                          <Shield size={16} />
                          <span className='font-bold'>SILVER</span>
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-16'>
                      <div className='grid grid-cols-3 gap-2'>
                        {renderTableSection(tablesData.silver, "left")}
                      </div>
                      <div className='grid grid-cols-3 gap-2'>
                        {renderTableSection(tablesData.silver, "right")}
                      </div>
                    </div>
                  </div>

                  {/* Regular Section */}
                  <div className='relative z-4'>
                    <div className='text-center mb-8'>
                      <div className='bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2 px-6 rounded-full inline-block border border-amber-600/50'>
                        <div className='flex items-center space-x-2'>
                          <Users size={16} />
                          <span className='font-bold'>REGULAR</span>
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-10 '>
                      <div className='grid grid-cols-4 space-x-1 space-y-8'>
                        {renderTableSection(tablesData.regular, "left")}
                      </div>
                      <div className='grid grid-cols-4 space-x-1 space-y-8'>
                        {renderTableSection(tablesData.regular, "right")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className='mt-12 max-sm:mt-8 border-t border-gray-700 pt-6'>
                <h3 className='text-lg font-bold mb-4 text-center'>LEGEND</h3>
                <div className='flex justify-center space-x-4 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-4 h-4 rounded-full bg-gradient-to-br from-green-600 to-green-800 border border-green-400'></div>
                    <span>Available</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='w-4 h-4 rounded-full bg-red-800 border border-red-600'></div>
                    <span>Booked</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <div className='w-4 h-4 rounded-full bg-yellow-600 border border-yellow-400'></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-900 border border-red-900/30 rounded-lg p-6 sticky top-24'>
              {!selectedTable ? (
                <div className='text-center'>
                  <Crown className='w-16 h-16 text-red-500 mx-auto mb-4' />
                  <h3 className='text-xl font-bold mb-2'>Select Your Table</h3>
                  <p className='text-gray-400 mb-6'>
                    Choose a table to view available seats and make your
                    reservation
                  </p>

                  <div className='space-y-4'>
                    {["vvip", "vip", "silver", "regular"].map((section) => {
                      const availableTables = tablesData[section].filter(
                        (t) => t.bookedSeats.length < t.totalSeats
                      ).length;
                      return (
                        <div
                          key={section}
                          className={`bg-gradient-to-r ${getSectionColor(
                            section
                          )} p-4 rounded border border-white/20`}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2'>
                              {getSectionIcon(section)}
                              <span className='font-bold uppercase'>
                                {section}
                              </span>
                            </div>
                            <div className='text-right'>
                              <div className='font-bold'>
                                {getSectionPrice(section)}
                              </div>
                              <div className='text-sm opacity-80'>
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
                  <div className='flex items-center justify-between mb-6'>
                    <div>
                      <h3 className='text-xl font-bold'>
                        Table {selectedTable.number}
                      </h3>
                      <p className='text-gray-400 uppercase'>
                        {selectedTable.section} Section
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-red-400'>
                        {getSectionPrice(selectedTable.section)}
                      </div>
                      <div className='text-sm text-gray-400'>per person</div>
                    </div>
                  </div>

                  {/* Seat Selection */}
                  <div className='mb-6'>
                    <h4 className='font-bold mb-10'>Select Seats</h4>
                    <TableVisualization
                      table={selectedTable}
                      selectedSeats={selectedSeats}
                      onSeatClick={handleSeatClick}
                    />
                    <div className='grid grid-cols-4 gap-2'>
                      {Array.from(
                        { length: selectedTable.totalSeats },
                        (_, i) => i + 1
                      ).map((seatNumber) => (
                        <SeatComponent
                          key={seatNumber}
                          seatNumber={seatNumber}
                          isBooked={selectedTable.bookedSeats.includes(
                            seatNumber
                          )}
                          isSelected={selectedSeats.includes(seatNumber)}
                          onSeatClick={handleSeatClick}
                        />
                      ))}
                    </div>
                    <div className='mt-3 text-sm text-gray-400'>
                      {selectedSeats.length} seat(s) selected
                    </div>
                  </div>

                  {/* Total */}
                  {selectedSeats.length > 0 && (
                    <div className='border-t border-gray-700 pt-4 mb-6'>
                      <div className='flex justify-between items-center'>
                        <span className='font-bold'>
                          Total ({selectedSeats.length} seats)
                        </span>
                        <span className='text-2xl font-bold text-red-400'>
                          ₦
                          {(
                            selectedSeats.length *
                            parseInt(
                              getSectionPrice(selectedTable.section).replace(
                                /[₦,]/g,
                                ""
                              )
                            )
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='space-y-3'>
                      <button
                        onClick={() => setShowCheckout(true)}
                      className={`w-full py-3 rounded font-bold transition-all duration-300 ${
                        selectedSeats.length > 0
                          ? "bg-gradient-to-r from-red-600 to-red-800 text-white border border-red-400/50 hover:shadow-lg"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={selectedSeats.length === 0}
                    >
                      RESERVE SEATS
                    </button>
                    <button
                      className='w-full py-3 border border-gray-600 text-gray-300 rounded font-bold hover:bg-gray-800 transition-all duration-300'
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

      
      {
        showCheckout && (
          <CheckoutForm 
          selectedSeats = {selectedSeats}
          baseAmount = {10000}
          onClose={() => setShowCheckout(false)}
          />
        )
      }
    
    </div>
  );
}

export default Booking