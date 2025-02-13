"use client"
import React from 'react'
import Image from 'next/image'
import { useRouter } from "next/navigation";



function AboutUs() {
    const router = useRouter();
  return (
    <div className="bg-[#E8F0E3] text-black min-h-screen flex flex-col items-center gap-8 p-8">
      <Image 
        src="/cat_plant.jpg"  // Make sure plant.jpg is in your public folder
        alt="Sustainable Plant"
        width={400}
        height={300}
        className="rounded-2xl shadow-lg"
      />
      <p className="max-w-6xl  text-lg leading-relaxed">
        This all started with my new year resolution of being more sustainable. Then i came up with this idea of 
        making this website with Sustainability and Upcycling at it's core XD. Before you throw out any object
        you might think is trash, try this website out and it might become a treasure, you will never know. Thank you for making it here 
        and may your love for Sustainability grow stronger ❤️
      </p>
      <button 
        onClick={() => router.push('/trial')}
        className="px-8 py-2 bg-[#565454] text-white rounded-lg hover:bg-black transition-colors duration-200"
      >
        Try - It
      </button>
    </div>
  )
}

export default AboutUs
