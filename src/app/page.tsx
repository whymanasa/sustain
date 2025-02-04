"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-cyan-500 font-sans text-4xl font-bold">
        sustainabiltity for life
      </h1>
      <div className="flex gap-4">
        <button 
          onClick={() => router.push('/trial')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          try it
        </button>
        <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors duration-200">
          sign up
        </button>
      </div>
    </div>
  );
}
