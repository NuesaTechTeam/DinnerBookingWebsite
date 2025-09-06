import { Calendar, Phone, Send } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const CTA = () => {

    const navigate = useNavigate();

    const handleReserveButton = () => {
      navigate("/book");
    };

    const sendEmail = () => {
      const subject = encodeURIComponent("Inquiry About Casablanca Dinner");
      const body = encodeURIComponent(
        "Hello, I would like more information about..."
      );
      window.location.href = `mailto:nuesadinner@gmail.com?subject=${subject}&body=${body}`;
    };
  return (
    <section className='py-20 max-sm:py-16 bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-t border-red-700'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-4xl md:text-5xl font-bold text-white mb-6 tracking-wide'>
          THE FAMIGLIA AWAITS
        </h2>
        <p className='text-xl text-red-100 mb-8 max-w-2xl mx-auto font-light'>
          This is your invitation to join the most exclusive gathering of the
          year. Honor. Respect. Unforgettable memories.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button 
          onClick={handleReserveButton}
          className='bg-black text-white px-8 py-4 text-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border border-white/20 tracking-wide'>
            <Calendar size={18} />
            <span>RESERVE YOUR PLACE</span>
          </button>
          <button 
          onClick={sendEmail}
          className='border-2 border-white text-white px-8 py-4 text-lg font-bold hover:bg-white hover:text-red-900 transition-all duration-300 flex items-center justify-center space-x-2 tracking-wide'>
            <Send  size={18} />
            <span>SPEAK TO THE CONSIGLIERE</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA