import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import Reveal from '../Reveal.jsx';

const CTA = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Inquiry submitted:', formData);
    // Handle inquiry submission state or toast notification
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-20 bg-[#050505] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left Column: Contact Details */}
        <Reveal className="flex flex-col justify-center" y={36}>
          <span className="text-[#d4af37] text-xs font-semibold tracking-[0.25em] uppercase mb-3 block">
            LET'S CONNECT
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#fcf6ba] mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-light mb-12">
            For bespoke reservations, corporate bookings, or diplomatic inquiries.
          </p>

          {/* Contact Items */}
          <div className="space-y-8">
            {/* Phone */}
            <Motion.div
              className="flex items-center gap-5"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">
                  CALL US
                </span>
                <span className="text-lg font-serif text-[#d4af37] font-semibold">
                  +234 812 345 6789
                </span>
              </div>
            </Motion.div>

            {/* Email */}
            <Motion.div
              className="flex items-center gap-5"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">
                  EMAIL INQUIRIES
                </span>
                <span className="text-lg font-serif text-[#d4af37] font-semibold">
                  nuesadinner@gmail.com
                </span>
              </div>
            </Motion.div>

            {/* Venue */}
            <Motion.div
              className="flex items-center gap-5"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase block mb-1">
                  GRAND VENUE
                </span>
                <span className="text-lg font-serif text-[#d4af37] font-semibold">
                  Alfa Belgore Hall, ABUAD, Ado-Ekiti
                </span>
              </div>
            </Motion.div>
          </div>
        </Reveal>

        {/* Right Column: Inquiry Form Card */}
        <Reveal delay={0.15} y={36}>
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider block mb-2">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  rows="4"
                  placeholder="Any dietary preferences or seating requests..."
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full bg-[#050505] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                />
              </div>

              <Motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold text-xs tracking-widest py-4 rounded-lg uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:brightness-110 transition-all cursor-pointer"
              >
                SUBMIT INQUIRY
              </Motion.button>
            </form>
          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default CTA;
