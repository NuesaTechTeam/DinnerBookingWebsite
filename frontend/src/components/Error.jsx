import React from 'react'
import PropTypes from 'prop-types'
import {useQueryClient} from "@tanstack/react-query"
import { RotateCcw, ShieldAlert, Undo2 } from 'lucide-react';
import Logo from "../assets/logo.png"

const Error = ({ error, resetErrorBoundary, queryKey }) => {

    const queryClient = useQueryClient();

     const retryQuery = () => {
       if (queryKey) {
         queryClient.refetchQueries({ queryKey });
       }
       if (resetErrorBoundary) {
         resetErrorBoundary();
       }
     };

     const errorMessage = error?.message || "An unexpected error occurred";
     const statusCode = error?.status || error?.response?.status;


  return (
    <div className="font-crimson bg-gradient-to-br from-black via-[#1a0d0d] to-black text-white h-full relative flex items-center justify-center p-4">
      {/* Background particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-0.5 h-0.5 bg-red-600 rounded-full opacity-0 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      
      <div className="flex flex-col justify-center items-center max-w-2xl w-full relative z-20 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-8 border border-red-700 shadow-xl">
        {/* Error Icon */}
        <div className="mb-6 relative">
            <img src={Logo} alt="nuesa logo" className='w-40' />
        </div>

        {/* Error Title */}
        <div className="text-center mb-4">
          <h1 className="font-playfair text-3xl md:text-4xl font-black bg-gradient-to-r from-red-600 via-amber-500 to-red-600 bg-clip-text text-transparent text-shadow-md tracking-wider">
            Connection Interrupted
          </h1>
          {statusCode && (
            <div className="text-red-500 text-lg mt-2">
              Error Code: {statusCode}
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h2 className="font-playfair text-2xl font-bold tracking-wider">
            <span className="text-white">CASA</span>
            <span className="text-red-600">BLANCA</span>
          </h2>
          <div className="text-red-500 text-sm tracking-wider uppercase">
            Honor • Legacy • Ambition
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-200 leading-relaxed mb-4">
            The <span className="text-red-500 font-semibold">famiglia</span>{" "}
            encountered a problem while gathering your data.
          </p>
          <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-700">
            <p className="text-red-200 font-medium">{errorMessage}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className=" flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={retryQuery}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 shadow-lg"
          >
            <div className="flex items-center justify-center gap-1">
              <Undo2 size={16} />
              Retry Connection
            </div>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 shadow-lg"
          >
            <div className="flex items-center justify-center gap-1">
              <RotateCcw size={16} />
              Reload Page
            </div>
          </button>
        </div>

        <div className=" text-center mt-8">
          <p className="text-red-400 text-sm">
            If the problem persists, contact the{" "}
            <span>famiglia support <strong className='font-bold text-red-500'>nuesadinner@gmail.com</strong></span>
          </p>
        </div>
      </div>

    </div>
  );
};

Error.propTypes = {
    error: PropTypes.object,
    resetErrorBoundary: PropTypes.func,
    queryKey: PropTypes.array,
}

export default Error