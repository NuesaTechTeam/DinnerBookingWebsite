import React from 'react'

const Quote = () => {
  return (
    <section className='py-14 md:py-20 bg-gradient-to-r from-red-900/10 to-black border-y border-red-900/30'>
      <div className='max-w-4xl mx-auto px-4 text-center'>
        <blockquote className='text-xl md:text-4xl font-light text-white mb-8 italic leading-relaxed font-cinzel'>
          "In this business, you keep your friends close,
          <span className='text-red-400 font-medium'>
            {" "}
            but your dinner reservations closer."
          </span>
        </blockquote>
        <cite className='text-red-400 font-bold tracking-wider font-playfair'>— THE DON</cite>
      </div>
    </section>
  );
}

export default Quote