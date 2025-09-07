import React, {  useState } from "react";
import PropTypes from "prop-types";
import Logo from "../assets/logo.png";
// import {useToast } from "../context/modal/useToast"

const LoadingScreen = () => {
  const [isLoading] = useState(true);

 


  return (
    <div
      className={`font-crimson scrollbar-hidden bg-gradient-to-br from-black via-[#2d1616]  to-black text-white h-full relative ${
        isLoading ? "" : "opacity-0 transition-opacity duration-1000"
      }`}
    >
    
      {/* Background particles */}
      {/* <div
        id="particles"
        className="particle scrollbar-hidden absolute top-0 left-0 w-full h-full overflow-hidden z-10"
      ></div> */}
      {/* Background particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10">
        {[...Array(50)].map((_, i) => (
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
      {/* Main loading container */}
      <div className="flex flex-col justify-center items-center relative z-20">
        {/* College Logo */}
        <div className="mb-2 mt-3 relative">
          <img src={Logo} alt="nuesa logo" className="w-34" />
        </div>

        {/* College Name */}
        <div className="text-center mb-4">
          <h1 className="font-playfair text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 via-white to-red-600 bg-clip-text text-transparent text-shadow-md tracking-wider mb-2 animate-titleShimmer">
            NUESA ABUAD
          </h1>
          <div className="text-amber-400 text-base tracking-wider uppercase font-semibold">
            {/* Nigerian University Engineering Students' Association */}
            Presents
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-wider mb-1">
            <span className="text-white">CASA</span>
            <span className="text-red-600">BLANCA</span>
          </h2>
          <div className="text-red-500 text-sm tracking-wider uppercase">
            Honor • Legacy • Ambition
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center mb-2 max-w-2xl px-5">
          <p className="text-lg text-gray-200 leading-relaxed italic mb-4">
            The <span className="text-red-500 font-semibold">famiglia</span> is
            preparing your exclusive experience...
          </p>
          <p className="text-lg text-gray-200 leading-relaxed italic">
            Where legends gather and{" "}
            <span className="text-red-500 font-semibold">
              respect is earned
            </span>
            .
          </p>
        </div>

        {/* Animation */}
        <div className=" flex flex-col items-center gap-5">
          {/* <div className=" w-72 md:w-80 h-1 bg-white bg-opacity-10 rounded-full overflow-hidden relative">
            <div className=" h-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600 bg-[length:200%_100%] rounded-full animate-progressFlow animate-progressLoad"></div>
          </div> */}

          <div className="flex gap-2 mt-2">
            <div className="dot w-3 h-3 bg-red-600 rounded-full animate-dotPulse"></div>
            <div className="dot w-3 h-3 bg-black rounded-full animate-dotPulse animation-delay-300"></div>
            <div className="dot w-3 h-3 bg-white rounded-full animate-dotPulse animation-delay-600"></div>
          </div>

          {/* <div className="text-amber-400 text-base tracking-wider uppercase font-semibold mt-2 animate-textPulse">
            {loadingMessage}
          </div> */}
        </div>

        <div className="text-center mt-5 p-5 max-w-xl">
          <p className="font-playfair text-xl italic text-amber-400 opacity-80 relative">
            Every legend begins with a single step into excellence
          </p>
        </div>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {};

export default LoadingScreen;
