"use client";

import React, { useState } from "react";
import { FaCamera, FaPaperPlane } from "react-icons/fa";

function Trial() {
  const [showOptions, setShowOptions] = useState(false);
  const [object, setObject] = useState("");
  const [style, setStyle] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCameraClick = () => {
    setShowOptions(!showOptions);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Uploaded file:", file);
    }
    setShowOptions(false);
  };

  const handleCapture = () => {
    console.log("Capture picture");
    setShowOptions(false);
  };

  const handleSend = async () => {
    if (!object.trim()) return;
  
    setLoading(true);
    setResponse("");
  
    try {
      const res = await fetch("/api/generateIdeas", { // ✅ Correct API path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object, style }),
      });
  
      const data = await res.json();
      setResponse(data.ideas || "No ideas generated.");
    } catch {
      setResponse("Error fetching ideas.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="black text-lg font-semibold p-4 text-center shadow-md" style={{ backgroundColor: "#123524" }}>
        Sustainable Reuse AI Chatbot
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: "#5A6C57" }}>
        {response ? <div className="bg-white text-black p-4 rounded">{response}</div> : "messages"}
      </div>

      {/* Input Section */}
      <div className="p-4 flex items-center gap-3 shadow-md" style={{ backgroundColor: "#123524" }}>
        <div className="relative">
          <button className="p-2 bg-gray-200 rounded-full" onClick={handleCameraClick}>
            <FaCamera className="text-gray-600" />
          </button>

          {showOptions && (
            <div className="absolute flex flex-col space-y-2 top-[-130px] left-0 bg-slate-900 rounded-lg pd-20 pr-20 pl-20">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer p-2 m-3 bg-black rounded-lg">
                Upload
              </label>
              <button onClick={handleCapture} className="p-2 bg-black rounded-lg">
                Capture
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="Describe your object..."
          value={object}
          onChange={(e) => setObject(e.target.value)}
          className="text-black flex-1 p-2 border rounded-lg outline-none"
        />

        <select className=" text-black p-2 border rounded-lg" value={style} onChange={(e) => setStyle(e.target.value)}>
          <option value="">Style (Optional)</option>
          <option value="simple">Simple</option>
          <option value="maximalistic">Maximalistic</option>
          <option value="retro">Retro</option>
        </select>

        <button onClick={handleSend} className="p-3 text-white rounded-full">
          {loading ? "..." : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );
}

export default Trial;
