import React, { useState } from 'react'
import Navbar from "../components/Navbar.jsx"
import { CTA, Faqs, Features, Hero, Packages, Quote, Testimonials, Footer } from "../components/Hero/index.js"
import { Error, LoadingScreen } from "../components/index.js"
import { useTables } from '../hooks/tableHooks.js'

const MAINTENANCE_PASSWORD = "NUESA123#";

const MaintenancePage = ({ onBypass }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center">
      <div className="mb-8">
        <div className="w-20 h-20 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3 tracking-wider">
          FÀÁJÍ LAWA
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6"></div>
      </div>
      <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
        Under maintenance, would soon be available
      </p>
      <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-400 text-sm mb-4">Enter maintenance password to bypass</p>
        <MaintenancePasswordForm onBypass={onBypass} />
      </div>
    </div>
  </div>
);

const MaintenancePasswordForm = ({ onBypass }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === MAINTENANCE_PASSWORD) {
      onBypass();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Maintenance password"
        className={`w-full bg-black/60 border rounded-lg px-4 py-3 text-white focus:border-[#d4af37] outline-none transition-colors ${
          error ? "border-red-500" : "border-zinc-700"
        }`}
        autoFocus
      />
      {error && <p className="text-red-400 text-sm">Incorrect password</p>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#b38728] via-[#fcf6ba] to-[#aa7c11] text-black font-extrabold py-3 rounded-lg hover:brightness-110 transition-all"
      >
        Access Site
      </button>
    </form>
  );
};

const Landing = () => {
  const { isLoading, error, refetch } = useTables();
  const [bypass, setBypass] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error)
    return (
      <div>
        <Error error={error} resetErrorBoundary={refetch} queryKey={["tables"]} />
      </div>
    );

  if (!bypass) {
    return <MaintenancePage onBypass={() => setBypass(true)} />;
  }

  return (
    <div className='min-h-screen bg-black text-white overflow-x-hidden scroll-smooth'>
      <Navbar />
      <Hero />
      <Quote />
      <Features />
      <Packages />
      <Testimonials />
      <CTA />
      <Faqs />
      <Footer />
    </div>
  )
}

export default Landing