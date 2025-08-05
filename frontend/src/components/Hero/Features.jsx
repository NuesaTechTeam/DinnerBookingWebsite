import React from 'react'
import { features } from '../../lib/constants';

const Features = () => {
  return (
    <section className='py-20 max-sm:py-16 bg-black'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide'>
            THE <span className='text-red-500'>CASABLANCA</span> EXPERIENCE
          </h2>
          <p className='text-xl text-gray-400 max-w-3xl mx-auto font-light'>
            Where every detail is orchestrated with the precision of a master
            strategist
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='group text-center p-8 border border-red-900/30 hover:border-red-500/50 hover:bg-red-900/10 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10'
            >
              <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 text-white border border-red-400/50 mb-6 group-hover:scale-110 transition-transform duration-300'>
                {feature.icon}
              </div>
              <h3 className='text-2xl font-bold text-white mb-4 tracking-wide'>
                {feature.title}
              </h3>
              <p className='text-gray-300 leading-relaxed font-light'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features