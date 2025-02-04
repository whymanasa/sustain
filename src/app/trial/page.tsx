"use client";

import React from 'react'
import { FaCamera, FaPaperPlane } from 'react-icons/fa'

function Trial() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white text-lg font-semibold p-4 text-center shadow-md">
        Sustainable Reuse AI Chatbot
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#5A6C57' }}>
        messages
      </div>

      {/* Input Section */}
      <div className="p-4 bg-black flex items-center gap-3 border-t shadow-md">
        <button className="p-2 bg-gray-200 rounded-full">
          <FaCamera className="text-gray-600" />
        </button>

        <input
          type="text"
          placeholder="Describe your object..."
          className="flex-1 p-2 border rounded-lg outline-none"
        />

        <select
            className="p-2 border rounded-lg"
        >
          <option value="">Style (Optional)</option>
          <option value="simple">Simple</option>
          <option value="maximalistic">Maximalistic</option>
          <option value="retro">Retro</option>
        </select>

        <button  className="p-3 bg-green-500 text-white rounded-full">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Trial
