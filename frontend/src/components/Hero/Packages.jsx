import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

const Packages = () => {
  const tiers = [
    {
      name: 'REGULAR',
      price: '₦8,000',
      period: '/ person',
      isRecommended: false,
      features: [
        'Standard banquet seating',
        'Exquisite 3-course meal',
        'Signature Welcome drink',
        'Award-winning Live entertainment',
      ],
      buttonStyle: 'border border-[#d4af37]/40 text-white hover:border-[#d4af37] hover:bg-[#d4af37]/10',
    },
    {
      name: 'VIP',
      price: '₦25,000',
      period: '/ person',
      isRecommended: true,
      badgeText: 'RECOMMENDED',
      features: [
        'Premium stage-front seating',
        'Gastronomic 5-course meal',
        'Premium drinks package',
        'Award-winning Live entertainment',
        'Exclusive Meet & Greet with Chef',
      ],
      buttonStyle: 'bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)]',
    },
    {
      name: 'VVIP',
      price: '₦40,000',
      period: '/ person',
      isRecommended: false,
      features: [
        'Exclusive front-row private seating',
        'Masterful 7-course tasting menu',
        'Unlimited premium vintage drinks',
        'Private VVIP lounge access & personal waiter',
        'Artisanal curated Luxury gift bag',
      ],
      buttonStyle: 'border border-[#d4af37]/40 text-white hover:border-[#d4af37] hover:bg-[#d4af37]/10',
    },
  ];

  return (
    <section id="packages" className="py-24 px-6 md:px-12 lg:px-20 bg-[#050505] text-white overflow-hidden">
      {/* Section Header */}
      <Motion.div
        className="max-w-3xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="text-[#d4af37] text-xs font-semibold tracking-[0.25em] uppercase mb-3 block">
          CURATED ACCESS
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#fcf6ba] mb-4">
          Our Packages
        </h2>
        <p className="text-gray-400 text-sm md:text-base font-light">
          Choose the tier that fits your standard of celebration. Space is strictly limited.
        </p>
      </Motion.div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier, index) => (
          <Motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.15 }}
            whileHover={{ y: -8 }}
            className={`relative flex flex-col justify-between rounded-2xl p-8 bg-[#0a0a0a] transition-colors duration-300 ${
              tier.isRecommended
                ? 'border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.2)] md:-translate-y-2'
                : 'border border-gray-800 hover:border-[#d4af37]/40'
            }`}
          >
            {/* Recommended Badge */}
            {tier.isRecommended && (
              <Motion.div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-[10px] font-extrabold tracking-widest uppercase px-4 py-1 rounded-full shadow-md"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {tier.badgeText}
              </Motion.div>
            )}

            <div>
              {/* Tier Name */}
              <span className="text-xs font-semibold tracking-wider text-[#d4af37] uppercase block mb-2">
                {tier.name}
              </span>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-gray-800">
                <span className="text-4xl md:text-5xl font-serif font-extrabold text-white">
                  {tier.price}
                </span>
                <span className="text-xs text-gray-400 font-light">
                  {tier.period}
                </span>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3 text-xs md:text-sm text-gray-300">
                    <svg
                      className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Book Now Button */}
            <Link to="/book" className="w-full">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${tier.buttonStyle}`}
              >
                BOOK NOW
              </Motion.button>
            </Link>
          </Motion.div>
        ))}
      </div>
    </section>
  );
};

export default Packages;
