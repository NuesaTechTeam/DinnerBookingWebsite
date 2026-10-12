import React from 'react'
import Navbar from "../components/Navbar.jsx"
import { CTA, Faqs, Features, Hero, Packages, Quote, Testimonials, Footer } from "../components/Hero/index.js"
import { Error, LoadingScreen } from "../components/index.js"
import { useTables } from '../hooks/tableHooks.js'

const Landing = () => {
  const { isLoading, error, refetch } = useTables();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error)
    return (
      <div>
        <Error error={error} resetErrorBoundary={refetch} queryKey={["tables"]} />
      </div>
    );

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
