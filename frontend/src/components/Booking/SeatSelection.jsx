import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Hero/Footer.jsx';
import logo from '../../assets/logo.png';
import { getTierLabel } from '../../lib/helpers.jsx';
import { Crown } from 'lucide-react';

const SeatSelection = ({
  isLoading,
  selectedSeats = [],
  tablesData = [],
  setSelectedSeats,
  setSelectedTable,
  setShowCheckout,
  bookedSeats = [],
  lockedSeats = [],
  checkAvailability,
  isChecking,
  totalAmount,
  setSeatNames,
  selectedTable,
}) => {
  const navigate = useNavigate();

  const safeTables = Array.isArray(tablesData) ? tablesData : [];

  const tierSummary = [
    {
      name: 'PLATINUM PACKAGE',
      price: '₦27,000',
      available: `${
        safeTables.filter(
          (t) =>
            t?.type?.toUpperCase() === 'VVIP' ||
            t?.section?.toUpperCase() === 'VVIP'
        ).length || 5
      } tables available`,
      icon: (
        <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      name: 'GOLD PACKAGE',
      price: '₦18,000',
      available: `${
        safeTables.filter(
          (t) =>
            t?.type?.toUpperCase() === 'VIP' ||
            t?.section?.toUpperCase() === 'VIP'
        ).length || 3
      } tables available`,
      icon: (
        <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: 'BRONZE TIER',
      price: '₦10,000',
      available: `${
        safeTables.filter(
          (t) =>
            t?.type?.toUpperCase() === 'REGULAR' ||
            t?.section?.toUpperCase() === 'REGULAR'
        ).length || 12
      } tables available`,
      icon: (
        <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const getTableId = (table) => table?._id || table?.id;

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setSelectedSeats([]);
    const activeId = getTableId(table);
    if (checkAvailability && activeId) {
      checkAvailability(activeId);
    }
  };

  const toggleSeatSelection = (seatNum) => {
    if (!selectedTable) return;
    const activeId = getTableId(selectedTable);
    const seatId = `${activeId}-S${seatNum}`;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getTableStatusClass = (tableId) => {
    const activeSelectedId = getTableId(selectedTable);
    const isBooked = Array.isArray(bookedSeats) && bookedSeats.includes(tableId);
    const isLocked = Array.isArray(lockedSeats) && lockedSeats.includes(tableId);

    if (activeSelectedId === tableId) {
      return 'bg-[#d4af37] text-black border-[#d4af37] ring-4 ring-[#d4af37]/40 shadow-[0_0_25px_rgba(212,175,55,0.8)]';
    }
    if (isBooked) {
      return 'bg-amber-500 text-black border-amber-500 cursor-not-allowed opacity-60';
    }
    if (isLocked) {
      return 'bg-yellow-600 text-black border-yellow-600 cursor-not-allowed opacity-60';
    }
    return 'bg-black text-[#d4af37] border-2 border-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all';
  };

  const getSeatPrice = () => {
    if (!selectedTable) return 0;
    if (selectedTable.price) return selectedTable.price;
    if (selectedTable.type === 'VVIP') return 27000;
    if (selectedTable.type === 'VIP') return 18000;
    return 10000;
  };

  const seatUnitPrice = getSeatPrice();
  const calculatedTotal = selectedSeats.length * seatUnitPrice;

  const tableCapacity = selectedTable?.capacity || 8;
  const availableSeatsCount = tableCapacity - selectedSeats.length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between font-sans">
      {/* Top Header Navbar */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-md px-4 sm:px-8 py-3 sm:py-5 flex flex-wrap items-center justify-between gap-3 sm:gap-6 sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#d4af37] transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <img src={logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-serif font-extrabold text-[#d4af37] tracking-wider uppercase">
                FÀÁJÍ LAWA
              </h1>
              <span className="text-[10px] sm:text-xs text-gray-400 font-light tracking-widest uppercase block mt-0.5">
                TABLE RESERVATIONS
              </span>
            </div>
          </div>
        </div>

        {/* Event Meta Badges */}
        <div className="flex w-full lg:w-auto flex-wrap items-center gap-x-4 gap-y-2 sm:gap-8 text-xs sm:text-sm text-gray-300 font-light">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#d4af37]"></span>
            <span>Sat, Oct 31st, 2026</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#d4af37]"></span>
            <span>7:00 PM</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#d4af37]"></span>
            <span>Alfa Belgore Hall</span>
          </div>
        </div>
      </header>

      {/* Main Floorplan & Dynamic Sidebar scaled up for desktop screens */}
      <main className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Interactive Floorplan */}
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-gray-800/80 rounded-3xl p-4 sm:p-8 md:p-12 flex flex-col items-center shadow-[0_0_40px_rgba(0,0,0,0.9)]">
          
          {/* Fully Gold Stage Banner with Black Text */}
          <div className="w-full max-w-2xl bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] rounded-2xl py-3 sm:py-4 text-center mb-8 sm:mb-12 shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase">
              STAGE
            </span>
          </div>

          {/* Floor Layout Grid */}
          <div className="relative w-full max-w-3xl mx-auto py-4 sm:py-6">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 bg-gradient-to-b from-[#b38728] via-[#fcf6ba] to-[#aa7c11] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)] hidden md:flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-black rotate-90 tracking-widest uppercase whitespace-nowrap">
                GOLD CARPET
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">
              {/* Left Column */}
              <div className="space-y-10">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-md uppercase mb-4 w-max">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-white via-[#fcf6ba] to-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.55)]">
                      <Crown size={11} className="text-black" strokeWidth={2.5} />
                    </span>
                    PLATINUM FRONT ROW
                  </span>
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="relative group">
                        {getTableId(selectedTable) === String(num) && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black border border-[#d4af37] text-xs text-[#d4af37] px-2.5 py-1 rounded whitespace-nowrap z-20 shadow-md font-medium">
                            <Crown size={12} className="text-[#fcf6ba]" />
                            Table PLATINUM-{num}
                          </div>
                        )}
                        <button
                          onClick={() => handleTableClick({ id: String(num), name: `Table PLATINUM-${num}`, type: 'VVIP', capacity: 8 })}
                          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center ${getTableStatusClass(String(num))}`}
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold tracking-wider text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-md uppercase block mb-4 w-max">
                    ⭐ GOLD SECTION
                  </span>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[9, 10, 11].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTableClick({ id: String(num), name: `Table GOLD-${num}`, type: 'VIP', capacity: 8 })}
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center ${getTableStatusClass(String(num))}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold tracking-wider text-gray-400 border border-gray-800 px-3 py-1 rounded-md uppercase block mb-4 w-max">
                    👤 BRONZE ZONE
                  </span>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[15, 16, 17, 18, 19, 20].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTableClick({ id: String(num), name: `Table BRONZE-${num}`, type: 'REGULAR', capacity: 8 })}
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center ${getTableStatusClass(String(num))}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-10 md:pl-6">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-md uppercase mb-4 w-max">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-white via-[#fcf6ba] to-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.55)]">
                      <Crown size={11} className="text-black" strokeWidth={2.5} />
                    </span>
                    PLATINUM FRONT ROW
                  </span>
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {[5, 6, 7, 8].map((num) => (
                      <div key={num} className="relative group">
                        {getTableId(selectedTable) === String(num) && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black border border-[#d4af37] text-xs text-[#d4af37] px-2.5 py-1 rounded whitespace-nowrap z-20 shadow-md font-medium">
                            <Crown size={12} className="text-[#fcf6ba]" />
                            Table PLATINUM-{num}
                          </div>
                        )}
                        <button
                          onClick={() => handleTableClick({ id: String(num), name: `Table PLATINUM-${num}`, type: 'VVIP', capacity: 8 })}
                          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center ${getTableStatusClass(String(num))}`}
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold tracking-wider text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-md uppercase block mb-4 w-max">
                    ⭐ GOLD SECTION
                  </span>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[12, 13, 14].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTableClick({ id: String(num), name: `Table GOLD-${num}`, type: 'VIP', capacity: 8 })}
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center ${getTableStatusClass(String(num))}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold tracking-wider text-gray-400 border border-gray-800 px-3 py-1 rounded-md uppercase block mb-4 w-max">
                    👤 BRONZE ZONE
                  </span>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[25, 26, 27].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTableClick({ id: String(num), name: `Table BRONZE-${num}`, type: 'REGULAR', capacity: 8 })}
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full font-bold text-sm sm:text-base flex items-center justify-center ${getTableStatusClass(String(num))}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend Bottom Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-8 mt-8 sm:mt-14 pt-6 sm:pt-8 border-t border-gray-800/80 w-full text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-[#d4af37]" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-amber-500" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-yellow-600" />
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-[#d4af37]" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Right Dynamic Sidebar Context */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
            {!selectedTable ? (
              <>
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-[#fcf6ba] to-[#d4af37] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,175,55,0.45)]">
                    <Crown className="w-5 h-5 text-black" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-[#fcf6ba] mb-3">
                    Select Your Table
                  </h2>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">
                    Choose a table from the floor plan to view available seats and secure your premium gala reservation.
                  </p>
                </div>

                <div className="space-y-4">
                  {tierSummary.map((tier, idx) => (
                    <div
                      key={idx}
                      className="bg-[#050505] border border-gray-800 rounded-2xl p-5 flex items-center justify-between hover:border-[#d4af37]/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-black/50 border border-gray-800">
                          {tier.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                            {tier.name}
                          </h3>
                          <span className="text-xs text-gray-400 font-light block mt-0.5">
                            {tier.available}
                          </span>
                        </div>
                      </div>
                      <span className="text-xl font-serif font-bold text-[#d4af37]">
                        {tier.price}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-[#fcf6ba] to-[#d4af37] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,175,55,0.45)]">
                    <Crown className="w-5 h-5 text-black" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-serif font-bold text-[#fcf6ba]">
                      {selectedTable.name}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/40">
                      {availableSeatsCount} / {tableCapacity} Available
                    </span>
                  </div>
                  <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase block mt-1.5">
                    {getTierLabel(selectedTable.type)} SECTION
                  </span>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-[#d4af37]">
                      ₦{seatUnitPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 font-light">per seat</span>
                  </div>
                </div>

                {/* Individual Seats Grid */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase block">
                      SELECT SEATS
                    </span>
                    <span className="text-xs text-gray-400">
                      {selectedSeats.length} of {tableCapacity} selected
                    </span>
                  </div>
                  <div className="bg-[#050505] border border-gray-800/80 rounded-2xl p-4 sm:p-8 flex flex-col items-center">
                    <div className="w-28 border border-[#d4af37]/40 text-center py-1.5 rounded text-xs text-[#d4af37] font-semibold mb-6 sm:mb-8">
                      {selectedTable.name}
                    </div>
                    <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-xs">
                      {Array.from({ length: tableCapacity }, (_, i) => i + 1).map((seatNum) => {
                        const activeId = getTableId(selectedTable);
                        const seatId = `${activeId}-S${seatNum}`;
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                          <button
                            key={seatNum}
                            onClick={() => toggleSeatSelection(seatNum)}
                            className={`h-11 sm:h-12 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.7)]'
                                : 'bg-[#0a0a0a] text-white border border-gray-800 hover:border-[#d4af37]'
                            }`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selection Totals */}
                <div className="pt-6 border-t border-gray-800 space-y-3">
                  <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase block">
                    YOUR SELECTION
                  </span>
                  <div className="flex items-center justify-between text-sm text-gray-400 font-light">
                    <span>{selectedSeats.length} seat(s) selected</span>
                    {selectedSeats.length > 0 && (
                      <span className="text-xs text-[#d4af37] font-semibold">
                        Seats: {selectedSeats.map((s) => s.split('-S')[1]).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-sm text-gray-400 font-light">Total Price:</span>
                    <span className="text-4xl font-serif font-bold text-[#d4af37]">
                      ₦{calculatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => {
                      if (selectedSeats.length > 0) setShowCheckout(true);
                    }}
                    disabled={selectedSeats.length === 0}
                    className={`w-full py-4 rounded-xl font-extrabold text-sm tracking-widest uppercase transition-all ${
                      selectedSeats.length > 0
                        ? 'bg-[#d4af37] text-black hover:brightness-110 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.5)]'
                        : 'bg-[#b89730]/40 text-black/40 cursor-not-allowed'
                    }`}
                  >
                    RESERVE {selectedSeats.length} SEAT(S)
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTable(null);
                      setSelectedSeats([]);
                    }}
                    className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                  >
                    BACK TO TABLES
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SeatSelection;