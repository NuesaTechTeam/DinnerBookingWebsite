import React from 'react'
import { HeaderHero, CTA, Faqs, Features,Hero, Packages,Quote, Testimonials, Footer} from "../components/Hero/index.js"

const Landing = () => {
  return (
    <div className='min-h-screen bg-black text-white overflow-x-hidden scroll-smooth'>
      {/* Header */}
      <HeaderHero />
      {/* Hero section */}
      <Hero />
      {/* Quote */}
      <Quote />
      {/* Features/ Experience section */}
      <Features />
      {/* Packages section */}
      <Packages />
      {/* Testimonials */}
      <Testimonials />
      {/* Cta */}
      <CTA />
      {/* Faqs section */}
      <Faqs />
      {/* Footer section */}
     <Footer />
    </div>
  )
}

export default Landing