import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Hero/Footer.jsx';
import logo from '../../assets/logo.png';
import { getSectionPrice, formatTierText } from '../../lib/helpers.jsx';
import { Crown, Star, User } from 'lucide-react';
import SeatArrangement from './SeatArrangement.jsx';

const naira = (value) => `₦${Number(value || 0).toLocaleString()}`;

// Platinum (VVIP) booking is disabled - set to false to re-enable it
const PLATINUM_DISABLED = true;

const getSeats = (table) => (Array.isArray(table?.seats) ? table.seats : []);

const isTableSoldOut = (table) => {
  const seats = getSeats(table);
  return seats.length > 0 && seats.every((seat) => seat.isBooked);
};

const getTableLabel = (tableNumber) => {
  const parts = String(tableNumber || '').split('-');
  return parts[parts.length - 1];
};

const getSeatLabel = (seatNumber) => {
  const match = String(seatNumber || '').match(/S(\d+)$/);
  return match ? match[1] : seatNumber;
};

const groupByTier = (tablesData) => {
  if (Array.isArray(tablesData)) {
    return tablesData.reduce((acc, table) => {
      const key = table?.type || 'OTHER';
      if (!acc[key]) acc[key] = [];
      acc[key].push(table);
      return acc;
    }, {});
  }
  return tablesData || {};
};

const TIERS = [
  {
    key: 'VVIP',
    label: 'PLATINUM',
    tagline: 'FRONT ROW',
    icon: Crown,
    badge: 'from-white via-[#fcf6ba] to-[#d4af37]',
    text: 'text-[#fcf6ba]',
  },
  {
    key: 'VIP',
    label: 'GOLD',
    tagline: 'SECTION',
    icon: Star,
    badge: 'from-[#fcf6ba] via-[#d4af37] to-[#aa7c11]',
    text: 'text-[#d4af37]',
  },
  {
    key: 'REGULAR',
    label: 'BRONZE',
    tagline: 'ZONE',
    icon: User,
    badge: 'from-[#e0a879] via-[#b87333] to-[#6b4423]',
    text: 'text-[#cd8f5f]',
  },
];

const SeatSelection = ({
  selectedSeats = [],
  tablesData = {},
  setSelectedSeats,
  setSelectedTable,
  setShowCheckout,
  bookedSeats = [],
  lockedSeats = [],
  selectedTable,
  setSeatNames,
}) => {
  const navigate = useNavigate();
  const grouped = useMemo(() => groupByTier(tablesData), [tablesData]);

  const seatUnitPrice =
    selectedTable?.pricePerSeat ||
    Number(getSectionPrice(selectedTable?.type).replace(/[₦,]/g, '')) ||
    0;

  const selectedSeatObjects = getSeats(selectedTable).filter((seat) =>
    selectedSeats.includes(seat._id)
  );
  const calculatedTotal = selectedSeats.length * seatUnitPrice;
  const tableCapacity = selectedTable?.capacity || getSeats(selectedTable).length || 0;
  const availableSeatsCount = Math.max(0, tableCapacity - selectedSeats.length);

  useEffect(() => {
    if (!setSeatNames) return;
    const seats = getSeats(selectedTable);
    setSeatNames(
      selectedSeats.map((id) => {
        const seat = seats.find((s) => s._id === id);
        return seat ? formatTierText(seat.seatNumber) : id;
      })
    );
  }, [selectedSeats, selectedTable, setSeatNames]);

  const handleTableClick = (table) => {
    if (table?.type === 'VVIP' && PLATINUM_DISABLED) return;
    setSelectedTable(table);
    setSelectedSeats([]);
    if (setSeatNames) setSeatNames([]);
  };

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    if (selectedSeats.includes(seat._id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat._id));
    } else {
      setSelectedSeats([...selectedSeats, seat._id]);
    }
  };

  const getTableStatusClass = (table, disabled = false) => {
    if (disabled) {
      return 'bg-[#121212] text-gray-600 border-gray-800 cursor-not-allowed opacity-50';
    }

    const isSelected = selectedTable?._id === table._id;
    const soldOut = isTableSoldOut(table);

    if (isSelected) {
      return 'bg-[#d4af37] text-black border-[#d4af37] ring-4 ring-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.7)]';
    }
    if (soldOut) {
      return 'bg-[#121212] text-gray-600 border-gray-800 cursor-not-allowed opacity-50';
    }
    return 'bg-black text-[#d4af37] border-2 border-[#d4af37]/70 hover:bg-[#d4af37] hover:text-black transition-all';
  };

  const getSeatStatusClass = (seat) => {
    const booked = seat.isBooked || bookedSeats.includes(seat._id);
    const locked = !booked && lockedSeats.includes(seat._id);
    const selected = selectedSeats.includes(seat._id);

    if (booked) {
      return 'bg-amber-950/60 text-amber-500/60 border-amber-800/50 cursor-not-allowed';
    }
    if (locked) {
      return 'bg-yellow-900/50 text-yellow-500/60 border-yellow-800/50 cursor-not-allowed';
    }
    if (selected) {
      return 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.7)]';
    }
    return 'bg-[#0a0a0a] text-white border border-gray-800 hover:border-[#d4af37]';
  };

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

      {/* Main Floorplan & Dynamic Sidebar */}
      <main className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Interactive Floorplan */}
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-gray-800/80 rounded-3xl p-4 sm:p-8 md:p-12 flex flex-col items-center shadow-[0_0_40px_rgba(0,0,0,0.9)]">
          {/* Stage Banner */}
          <div className="w-full max-w-2xl bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] rounded-2xl py-3 sm:py-4 text-center mb-8 sm:mb-12 shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase">
              STAGE
            </span>
          </div>

          <div className="relative w-full">
            {/* Gold Carpet running through the middle */}
            <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-6 sm:w-8 hidden md:flex items-center justify-center z-0 rounded-full bg-gradient-to-b from-[#b38728] via-[#fcf6ba] to-[#aa7c11] shadow-[0_0_25px_rgba(212,175,55,0.45)]">
              <span className="text-[9px] font-extrabold text-black rotate-90 tracking-[0.3em] uppercase whitespace-nowrap">
                GOLD CARPET
              </span>
            </div>

            <div className="relative z-10 space-y-12">
              {TIERS.map((tier) => {
                const list = grouped[tier.key] || [];
                const Icon = tier.icon;
                const isBanquet = tier.key === 'VVIP';
                const mid = Math.ceil(list.length / 2);
                const leftTables = list.slice(0, mid);
                const rightTables = list.slice(mid);
                const sideColumns = isBanquet
                  ? 'grid-cols-2 gap-3'
                  : tier.key === 'VIP'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
                  : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2';

                const renderTable = (table) => {
                  const disabled =
                    isTableSoldOut(table) ||
                    (tier.key === 'VVIP' && PLATINUM_DISABLED);

                  return isBanquet ? (
                    <button
                      key={table._id}
                      onClick={() => !disabled && handleTableClick(table)}
                      disabled={disabled}
                      title={
                        tier.key === 'VVIP' && PLATINUM_DISABLED
                          ? 'Platinum booking is currently unavailable'
                          : undefined
                      }
                      className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${getTableStatusClass(
                        table,
                        disabled
                      )}`}
                    >
                      <Crown size={14} strokeWidth={2.5} />
                      Table {getTableLabel(table.tableNumber)}
                    </button>
                  ) : (
                    <button
                      key={table._id}
                      onClick={() => !disabled && handleTableClick(table)}
                      disabled={disabled}
                      title={
                        tier.key === 'VVIP' && PLATINUM_DISABLED
                          ? 'Platinum booking is currently unavailable'
                          : `Table ${getTableLabel(table.tableNumber)} · ${table.capacity} seats`
                      }
                      className={`w-full aspect-square rounded-full font-bold text-xs flex items-center justify-center ${getTableStatusClass(
                        table,
                        disabled
                      )}`}
                    >
                      {getTableLabel(table.tableNumber)}
                    </button>
                  );
                };

                return (
                  <div key={tier.key} className="w-full">
                    {/* Tier header (masks the carpet behind it) */}
                    <div className="relative z-10 mx-auto mb-5 w-max max-w-full bg-[#0a0a0a] px-3">
                      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#d4af37] border border-[#d4af37]/40 px-3 py-1 rounded-md uppercase">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br ${tier.badge} shadow-[0_0_8px_rgba(212,175,55,0.5)]`}>
                            <Icon size={11} className="text-black" strokeWidth={2.5} />
                          </span>
                          {tier.label} {tier.tagline}
                          {tier.key === 'VVIP' && PLATINUM_DISABLED && (
                            <span className="ml-2 text-[9px] font-extrabold tracking-widest text-gray-400 border border-gray-700 rounded-full px-2 py-0.5">
                              UNAVAILABLE
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {list.length === 0 ? (
                      <p className="text-xs text-gray-500 font-light text-center">No tables available.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-24 gap-y-3">
                        <div className={`grid ${sideColumns}`}>
                          {leftTables.map(renderTable)}
                        </div>
                        <div className={`grid ${sideColumns}`}>
                          {rightTables.map(renderTable)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
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
                  {TIERS.map((tier) => {
                    const list = grouped[tier.key] || [];
                    const totalSeats = list.reduce((sum, table) => sum + (table.capacity || 0), 0);
                    const price = list[0]?.pricePerSeat || Number(getSectionPrice(tier.key).replace(/[₦,]/g, ''));
                    const Icon = tier.icon;
                    return (
                      <div
                        key={tier.key}
                        className={`bg-[#050505] border border-gray-800 rounded-2xl p-5 flex items-center justify-between transition-colors ${
                          tier.key === 'VVIP' && PLATINUM_DISABLED
                            ? 'opacity-50 grayscale'
                            : 'hover:border-[#d4af37]/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${tier.badge}`}>
                            <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                              {tier.label}
                            </h3>
                            <span className="text-xs text-gray-400 font-light block mt-0.5">
                              {list.length} tables · {totalSeats} seats
                            </span>
                          </div>
                        </div>
                        {tier.key === 'VVIP' && PLATINUM_DISABLED ? (
                          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase border border-gray-700 rounded-full px-3 py-1">
                            UNAVAILABLE
                          </span>
                        ) : (
                          <span className="text-xl font-serif font-bold text-[#d4af37]">
                            {naira(price)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,175,55,0.45)] ${
                    TIERS.find((t) => t.key === selectedTable.type)?.badge
                      ? `bg-gradient-to-br ${TIERS.find((t) => t.key === selectedTable.type).badge}`
                      : 'bg-gradient-to-br from-white via-[#fcf6ba] to-[#d4af37]'
                  }`}>
                    <Crown className="w-5 h-5 text-black" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fcf6ba]">
                      {formatTierText(selectedTable.tableNumber)}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/40">
                      {availableSeatsCount} / {tableCapacity} Available
                    </span>
                  </div>
                  <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase block mt-1.5">
                    {formatTierText(selectedTable.type)} SECTION
                  </span>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-[#d4af37]">
                      {naira(seatUnitPrice)}
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
                  <div className="bg-[#050505] border border-gray-800/80 rounded-2xl p-4 sm:p-6 flex flex-col items-center">
                    <SeatArrangement
                      table={selectedTable}
                      bookedSeats={bookedSeats}
                      lockedSeats={lockedSeats}
                      onSeatClick={toggleSeat}
                      getSeatStatusClass={getSeatStatusClass}
                    />
                  </div>
                </div>

                {/* Selection Totals */}
                <div className="pt-6 border-t border-gray-800 space-y-3">
                  <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase block">
                    YOUR SELECTION
                  </span>
                  <div className="flex items-center justify-between text-sm text-gray-400 font-light">
                    <span>{selectedSeats.length} seat(s) selected</span>
                    {selectedSeatObjects.length > 0 && (
                      <span className="text-xs text-[#d4af37] font-semibold">
                        Seats: {selectedSeatObjects.map((s) => getSeatLabel(s.seatNumber)).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-sm text-gray-400 font-light">Total Price:</span>
                    <span className="text-4xl font-serif font-bold text-[#d4af37]">
                      {naira(calculatedTotal)}
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
                      if (setSeatNames) setSeatNames([]);
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
