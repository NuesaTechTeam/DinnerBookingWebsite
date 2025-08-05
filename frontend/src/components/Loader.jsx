import React from 'react'
import logo from "../assets/logo.png";

const Loader = () => {
  return (
      <div className="flex min-h-screen w-full h-full justify-center bg-black/70 z-[9999]">
      <img
        src={logo}
        alt="Nuesa"
        className="w-[3rem] h-[4rem] my-auto animate-pulse object-cover"
      />
    </div>
  )
}

export default Loader