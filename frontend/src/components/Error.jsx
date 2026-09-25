import React from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Undo2 } from 'lucide-react';
import Logo from "../assets/logo.png";

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
    <div className="font-sans bg-gradient-to-br from-[#09090b] via-[#12100b] to-[#09090b] text-white h-screen relative flex items-center justify-center p-4">
      {/* Background Gold Particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-0.5 h-0.5 bg-[#d4af37] rounded-full opacity-0 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main Error Container */}
      <div className="flex flex-col justify-center items-center max-w-2xl w-full relative z-20 bg-[#09090b]/80 backdrop-blur-md rounded-xl p-8 border border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
        {/* Logo */}
        <div className="mb-6 relative">
          <img src={Logo} alt="Fàájí Lawa Logo" className="w-40 object-contain" />
        </div>

        {/* Error Title */}
        <div className="text-center mb-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] bg-clip-text text-transparent tracking-wider">
            Connection Interrupted
          </h1>
          {statusCode && (
            <div className="text-[#d4af37]/80 text-sm font-semibold tracking-wide mt-2">
              ERROR CODE: {statusCode}
            </div>
          )}
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] uppercase">
            FÀÁJÍ LAWA
          </h2>
          <div className="text-[#d4af37]/80 text-xs tracking-widest uppercase mt-1">
            Celebration • Culture • Elegance
          </div>
        </div>

        {/* Error Details */}
        <div className="text-center mb-8 w-full">
          <p className="text-base text-gray-300 leading-relaxed mb-4">
            We encountered a slight issue while processing your request.
          </p>
          <div className="bg-[#18150c]/80 p-4 rounded-lg border border-[#d4af37]/30 shadow-inner">
            <p className="text-[#fcf6ba] font-medium text-sm">{errorMessage}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={retryQuery}
            className="flex-1 bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] hover:brightness-110 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] text-xs tracking-wider uppercase cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <Undo2 size={16} />
              Retry Connection
            </div>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-black/60 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37] font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-xs tracking-wider uppercase cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              <RotateCcw size={16} />
              Reload Page
            </div>
          </button>
        </div>

        {/* Support Link */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">
            If the problem persists, contact support at{" "}
            <a
              href="mailto:nuesa.abuad.tech@gmail.com"
              className="font-semibold text-[#d4af37] hover:underline"
            >
              nuesa.abuad.tech@gmail.com
            </a>
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
};

export default Error;