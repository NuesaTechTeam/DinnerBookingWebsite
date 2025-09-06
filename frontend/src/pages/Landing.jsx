import React from 'react'
import { HeaderHero, CTA, Faqs, Features,Hero, Packages,Quote, Testimonials, Footer} from "../components/Hero/index.js"
import {Error, LoadingScreen} from "../components/index.js"
import { useTables } from '../hooks/tableHooks.js'

const Landing = () => {
const {isLoading, error, refetch} = useTables()

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