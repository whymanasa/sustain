"use client"
import React, { useState, useEffect } from "react"
import { FaCamera as Camera, FaPaperPlane as PaperPlane, FaUpload as Upload } from "react-icons/fa"

const Trial: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false)
  const [object, setObject] = useState("")
  const [isFollowUp, setIsFollowUp] = useState(false)
  const [followUp, setFollowUp] = useState("")
  const [style, setStyle] = useState("versatile")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [queries, setQueries] = useState<string[]>([])
  const [responses, setResponses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedQueries = sessionStorage.getItem("chatQueries")
    const savedResponses = sessionStorage.getItem("chatResponses")
    const savedStyle = sessionStorage.getItem("selectedStyle")

    if (savedQueries) setQueries(JSON.parse(savedQueries))
    if (savedResponses) setResponses(JSON.parse(savedResponses))
    if (savedStyle) setStyle(savedStyle)
  }, [])

  useEffect(() => {
    sessionStorage.setItem("chatQueries", JSON.stringify(queries))
    sessionStorage.setItem("chatResponses", JSON.stringify(responses))
    sessionStorage.setItem("selectedStyle", style)
  }, [queries, responses, style])

  const handleCameraClick = () => setShowOptions(!showOptions)

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
    setShowOptions(false)
  }

  const handleCapture = async () => {
    try {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'camera'; // Automatically open camera on mobile devices
  
      // Handle file selection
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          const selectedFile = target.files[0];
          setFile(selectedFile);
          setPreview(URL.createObjectURL(selectedFile));
        }
      };
  
      // Open the file input dialog (camera on mobile)
      input.click();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };
  const handleSend = async () => {
    if (!object.trim() && !file && !followUp.trim()) return

    setLoading(true)

    const formData = new FormData()
    let userQuery = ""

    if (file) {
      formData.append("image", file)
      userQuery = "User uploaded an image."
    } else if (isFollowUp) {
      formData.append("followUp", followUp)
      formData.append("previousQuery", queries.length > 0 ? queries[queries.length - 1] : "")
      formData.append("previousResponse", responses.length > 0 ? responses[responses.length - 1] : "")
      userQuery = followUp
    } else {
      formData.append("object", object)
      userQuery = object
    }
    formData.append("style", style)

    try {
      const res = await fetch("/api/generateIdeas", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.ideas) {
        setQueries([...queries, userQuery])
        setResponses([...responses, data.ideas])
      }
    } catch {
      setQueries([...queries, userQuery])
      setResponses([...responses, "Error fetching ideas."])
    }

    setLoading(false)
  }
  const removeImage = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="flex flex-col h-screen bg-[#E8F0E3] text-[#3A4A40]">
      <header className="bg-[#5A7052] text-[#FFFFFF] text-xl font-bold p-6 text-center shadow-lg rounded-b-2xl">
        Sustainable Reuse AI Chatbot
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#C9DABF] rounded-2xl shadow-inner m-4">
        {queries.length > 0 ? (
          queries.map((query, index) => (
            <div key={index} className="space-y-4">
              <div className="text-right bg-[#8FA880] text-[#FFFFFF] p-4 rounded-2xl max-w-md ml-auto shadow-md transition-all duration-300 hover:shadow-lg">
                <strong className="block mb-1 text-[#E8F0E3]">You:</strong> {query}
              </div>
              {responses[index] && (
                <div className="text-left bg-[#5A7052] text-[#FFFFFF] p-4 rounded-2xl max-w-xl mr-auto shadow-md transition-all duration-300 hover:shadow-lg">
                  <strong className="block mb-1 text-[#E8F0E3]">AI:</strong> {responses[index]}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-[#5A7052] text-center text-lg italic">No messages yet. Start a conversation!</p>
        )}
      </main>

      {preview && (
        <div className="flex justify-center p-4">
          <img
            src={preview || "/placeholder.svg"}
            alt="Uploaded Preview"
            className="max-w-xs max-h-20 rounded-2xl shadow-md"
          />
          <button className="ml-5" onClick={removeImage}>X</button>
        </div>
      )}

      <footer className="p-6 flex items-center gap-4 bg-[#8FA880] shadow-lg rounded-t-2xl m-4 mt-0">
        <div className="relative">
          <button
            onClick={handleCameraClick}
            className="rounded-full p-3 bg-[#5A7052] text-white hover:bg-[#4B5945] transition-colors duration-300"
          >
            <Camera className="h-5 w-5" />
          </button>

          {showOptions && (
            <div className="absolute flex flex-col space-y-2 bottom-full left-0 mb-2 bg-[#C9DABF] p-3 rounded-xl shadow-lg">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="cursor-pointer p-2 bg-[#8FA880] text-white rounded-md hover:bg-[#7A9470] transition-colors duration-300"
              >
                <Upload className="h-4 w-4 inline-block mr-2" /> Upload
              </label>
              <button
                onClick={handleCapture}
                className="p-2 bg-[#5A7052] text-white rounded-md hover:bg-[#4B5945] transition-colors duration-300"
              >
                <Camera className="h-4 w-4 inline-block mr-2" /> Capture
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder={!isFollowUp ? "Describe your object..." : "Ask a follow-up question..."}
          value={isFollowUp ? followUp : object}
          onChange={(e) => (isFollowUp ? setFollowUp(e.target.value) : setObject(e.target.value))}
          className="flex-1 p-3 border rounded-xl bg-[#E8F0E3] text-[#3A4A40] placeholder-[#8FA880] focus:outline-none focus:ring-2 focus:ring-[#5A7052] transition-all duration-300"
        />

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="p-3 border rounded-xl bg-[#5A7052] text-white focus:outline-none focus:ring-2 focus:ring-[#8FA880] transition-all duration-300"
        >
          <option value="versatile">Versatile</option>
          <option value="minimalist">Minimalist</option>
          <option value="boho">Boho</option>
          <option value="modern">Modern</option>
          <option value="rustic">Rustic</option>
        </select>

        <button
          onClick={() => setIsFollowUp(!isFollowUp)}
          className="p-3 bg-[#5A7052] text-white rounded-xl hover:bg-[#4B5945] transition-colors duration-300"
        >
          {isFollowUp ? "New Query" : "Follow-up"}
        </button>

        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded-full p-3 bg-[#5A7052] text-white hover:bg-[#4B5945] transition-colors duration-300"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <PaperPlane className="h-5 w-5" />
          )}
        </button>
      </footer>
    </div>
  )
}

export default Trial
