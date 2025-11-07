import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [smokeAnimation, setSmokeAnimation] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const smokeTimer = setInterval(() => {
      setSmokeAnimation((prev) => (prev + 1) % 3);
    }, 2000);

    return () => {
      clearInterval(smokeTimer);
    };
  }, []);

  const navigate = useNavigate();

  const handleFamigliaButton = () => {
    navigate("/book");
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dramatic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-red-900/20"></div>

        {/* Animated smoke effects */}
        <div
          className={`absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-3xl transition-all duration-2000 ${
            smokeAnimation === 0
              ? "opacity-30 scale-100"
              : smokeAnimation === 1
              ? "opacity-20 scale-110"
              : "opacity-10 scale-120"
          }`}
        ></div>
        <div
          className={`absolute bottom-40 right-32 w-24 h-24 bg-red-500/10 rounded-full blur-2xl transition-all duration-2000 ${
            smokeAnimation === 1
              ? "opacity-40 scale-100"
              : smokeAnimation === 2
              ? "opacity-30 scale-110"
              : "opacity-20 scale-90"
          }`}
        ></div>
      </div>

      <div
        className={`relative z-20 text-center max-w-6xl mx-auto px-4 transform transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Main Title */}
        <div className="mb-8 py-2">
          <div className="text-sm text-red-400 font-bold tracking-[0.3em] mb-4">
            NUESA ABUAD PRESENTS
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 leading-none tracking-wider">
            CASA
            <span className="block text-red-500">BLANCA</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 md:space-x-8 text-white/80 text-lg font-medium tracking-widest font-cinzel">
            <span>HONOR</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>LEGACY</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>AMBITION</span>
          </div>
        </div>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          Step into a world where honor meets sophistication, where legends are
          born, and where every moment is crafted with meticulous precision.
          <span className="text-red-400 font-medium italic">
            {" "}
            This is not just dinner—this is initiation into excellence.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button
            onClick={handleFamigliaButton}
            className="group bg-gradient-to-r from-red-600 to-red-800 text-white px-8 md:px-10 py-3 md:py-4 border border-red-400/50 text-lg font-semibold hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 tracking-wider"
          >
            <span>JOIN THE FAMIGLIA</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollToSection("famiglia")}
            className="max-md:hidden border-2 border-white text-white px-10 py-4 text-lg font-bold hover:bg-white hover:text-black transition-all duration-300 tracking-wide"
          >
            WATCH THE LEGACY
          </button>
        </div>

        {/* Coming Soon Badge */}
        <div className="inline-block">
          <div className="bg-red-600/20 border border-red-500/50 px-8 py-3 backdrop-blur-sm">
            <div className="text-red-400 font-bold tracking-[0.2em] text-lg">
              22ND NOVEMBER, 2025
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-red-500 rotate-45 opacity-60 animate-pulse"></div>
      <div className="absolute top-32 right-20 w-3 h-3 bg-white rotate-45 opacity-40 animate-pulse delay-700"></div>
      <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-red-400 rotate-45 opacity-50 animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-white opacity-60 animate-ping delay-500"></div>
    </section>
  );
};

export default Hero;
