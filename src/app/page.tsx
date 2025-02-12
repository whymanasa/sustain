"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-[#E8F0E3] min-h-screen flex flex-col items-center justify-center gap-8">
      <video 
        className="max-w-xl rounded-2xl "
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/cat.webm" type="video/webm" />
      </video>

      <button 
        onClick={() => router.push('/trial')}
        className="px-8 py-2 bg-[#565454] text-white rounded-lg hover:bg-black transition-colors duration-200"
      >
        Try It
      </button>
      <button 
        className="px-6 py-2 bg-[#565454] text-white rounded-lg hover:bg-black transition-colors duration-200"
      >
        SignUp
      </button>
    </div>
  );
}
