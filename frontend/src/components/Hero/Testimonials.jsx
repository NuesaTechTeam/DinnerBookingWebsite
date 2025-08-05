import React, { useEffect, useState } from "react";
import { testimonials } from "../../lib/constants";
import { Star } from "lucide-react";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <section
      id='famiglia'
      className='py-20 max-sm:py-16 bg-black border-t border-red-900/30'
    >
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-4xl font-bold text-white mb-12 tracking-wide'>
          WHAT THE <span className='text-red-500'>FAMIGLIA</span> SAYS
        </h2>

        <div className='relative'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                index === currentTestimonial
                  ? "opacity-100 transform translate-x-0"
                  : "opacity-0 transform translate-x-full absolute inset-0"
              }`}
            >
              <div className='bg-gradient-to-br from-red-900/20 to-black border border-red-900/50 p-8 max-sm:px-4 max-sm:py-6 shadow-lg'>
                <div className='flex justify-center mb-4 gap-1'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 text-red-400 fill-current'
                    />
                  ))}
                </div>
                <blockquote className='text-xl text-gray-300 mb-6 italic font-light font-cinzel'>
                  "{testimonial.text}"
                </blockquote>
                <cite className='text-lg font-bold text-red-400 tracking-wide font-playfair'>
                  — {testimonial.name}
                </cite>
              </div>
            </div>
          ))}
        </div>

        <div className='flex justify-center mt-8 space-x-2'>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 transition-all duration-300 ${
                index === currentTestimonial ? "bg-red-500" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
