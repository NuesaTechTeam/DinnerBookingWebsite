import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import logo from "../../assets/logo.png";

// Shown instead of the seat map once bookings are closed
const BookingClosed = () => (
  <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-5 py-12 selection:bg-[#d4af37] selection:text-black">
    <div className="w-full max-w-lg text-center">
      <img src={logo} alt="Logo" className="w-20 h-20 object-contain mx-auto mb-6" />
      <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#d4af37] tracking-widest uppercase leading-tight">
        Thank You
      </h1>
      <div className="mx-auto my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      <p className="text-gray-300 leading-relaxed">
        Bookings for <span className="text-[#d4af37] font-semibold">FÀÁJÍ LAWA</span> are now
        closed. We are grateful for the overwhelming response and for every guest who has
        secured a seat.
      </p>
      <p className="text-gray-400 text-sm leading-relaxed mt-4">
        If you have already booked, your ticket is in your email. We can't wait to celebrate
        with you.
      </p>

      <div className="mt-8 rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-5 text-sm text-gray-300 space-y-3 text-left">
        <p className="flex items-center gap-3">
          <CalendarDays size={16} className="text-[#d4af37] shrink-0" />
          Saturday, 31 October 2026
        </p>
        <p className="flex items-center gap-3">
          <Clock size={16} className="text-[#d4af37] shrink-0" />
          7:00 PM
        </p>
        <p className="flex items-center gap-3">
          <MapPin size={16} className="text-[#d4af37] shrink-0" />
          Alfa Belgore Hall
        </p>
      </div>

      <Link
        to="/"
        className="inline-block mt-8 text-xs font-bold tracking-widest uppercase text-[#d4af37] border border-[#d4af37]/40 rounded-lg px-5 py-3 hover:bg-[#d4af37]/10 transition-colors"
      >
        Back to home
      </Link>
    </div>
  </div>
);

export default BookingClosed;
