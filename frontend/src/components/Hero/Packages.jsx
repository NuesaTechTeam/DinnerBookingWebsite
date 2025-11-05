import React from 'react'
import { packages } from '../../lib/constants';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Packages = () => {
 const navigate =  useNavigate()
  const handleClick = () => { 
   navigate("/book")
 }
  return (
    <section
      id='packages'
      className='py-20 max-sm:py-16 bg-gradient-to-b from-black to-red-900/20'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide'>
            CHOOSE YOUR <span className='text-red-500'>RANK</span>
          </h2>
          <p className='text-xl text-gray-400 max-w-3xl mx-auto font-light'>
            Every position in the famiglia comes with its privileges
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-10'>
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-black border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:scale-105 ${
                index === 1
                  ? "border-red-500 bg-gradient-to-b from-red-900/20 to-black transform scale-105"
                  : "border-red-900/50 hover:border-red-500/70"
              }`}
            >
              {index === 3 && (
                <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-gradient-to-r from-red-600 to-red-800 text-white px-4 max-sm:px-1 py-2 text-sm font-bold tracking-wide border border-red-400/50'>
                    MOST RESPECTED
                  </span>
                </div>
              )}
              <div className='text-center mb-8'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 text-white border border-red-400/50 mb-4'>
                  {pkg.icon}
                </div>
                <h3 className='text-2xl font-bold text-white mb-2 tracking-wide'>
                  {pkg.name}
                </h3>
                <div className='text-4xl font-bold text-red-400 mb-2'>
                  {pkg.price}
                </div>
                <p className='text-gray-400 flex items-center justify-center font-medium'>
                  <Users className='w-4 h-4 mr-1' />
                  {pkg.guests}
                </p>
              </div>
              <ul className='space-y-3 mb-8'>
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className='flex items-center text-gray-300'>
                    <div className='w-2 h-2 bg-red-500 mr-3 flex-shrink-0'></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleClick}
                className={`w-full py-3 font-bold transition-all duration-300 tracking-wide ${
                  index === 1
                    ? "bg-gradient-to-r from-red-600 to-red-800 text-white border border-red-400/50 hover:shadow-lg hover:shadow-red-500/25"
                    : "border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                }`}
              >
                CLAIM YOUR POSITION
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Packages