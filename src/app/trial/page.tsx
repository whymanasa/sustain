"use client"
import React, { useState, useEffect } from "react"
import { FaCamera, FaPaperPlane, FaUpload } from "react-icons/fa"

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
    // Load previous session data
    const savedQueries = sessionStorage.getItem("chatQueries")
    const savedResponses = sessionStorage.getItem("chatResponses")
    const savedStyle = sessionStorage.getItem("selectedStyle")

    if (savedQueries) setQueries(JSON.parse(savedQueries))
    if (savedResponses) setResponses(JSON.parse(savedResponses))
    if (savedStyle) setStyle(savedStyle)
  }, [])

  useEffect(() => {
    // Save queries, responses, and style separately
    sessionStorage.setItem("chatQueries", JSON.stringify(queries))
    sessionStorage.setItem("chatResponses", JSON.stringify(responses))
    sessionStorage.setItem("selectedStyle", style)
  }, [queries, responses, style])

  const handleCameraClick = () => setShowOptions(!showOptions)

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile)) // Show preview
    }
    setShowOptions(false)
  }

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
    formData.append("style", style) // ✅ Send selected style

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

  return (
    <div className="flex flex-col h-screen bg-[#C9DABF] text-[#5F6F65]">
      <header className="bg-[#4B5945] text-[#FFFFFF] text-lg font-semibold p-4 text-center shadow-md rounded-b-lg">
        Sustainable Reuse AI Chatbot
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#808D7C] rounded-lg shadow-md">
        {queries.length > 0 ? (
          queries.map((query, index) => (
            <div key={index} className="space-y-2">
              <div className="text-right bg-[#9CA986] text-[#FFFFFF] p-3 rounded-lg max-w-xs ml-auto shadow-md">
                <strong>You:</strong> {query}
              </div>
              {responses[index] && (
                <div className="text-left bg-[#4B5945] text-[#FFFFFF] p-3 rounded-lg max-w-xs mr-auto shadow-md">
                  <strong>AI:</strong> {responses[index]}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-[#5F6F65] text-center">No messages yet</p>
        )}
      </main>

      {/* Preview uploaded image */}
      {preview && (
        <div className="flex justify-center p-4">
          <img src={preview} alt="Uploaded Preview" className="max-w-xs max-h-40 rounded-lg shadow-md" />
        </div>
      )}

      <footer className="p-4 flex items-center gap-3 bg-[#9CA986] shadow-md rounded-t-lg">
        <div className="relative">
          <button onClick={handleCameraClick} className="rounded-full p-2 bg-[#4B5945] text-white">
            <FaCamera className="h-4 w-4" />
          </button>

          {showOptions && (
            <div className="absolute flex flex-col space-y-2 bottom-full left-0 mb-2 bg-[#808D7C] p-2 rounded-lg shadow-lg">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer p-2 bg-[#9CA986] text-white rounded-md hover:bg-opacity-80 transition-colors">
                <FaUpload className="h-4 w-4 inline-block mr-2" /> Upload
              </label>
              <button onClick={() => console.log("Capture Picture")} className="p-2 bg-[#4B5945] text-white rounded-md">
                <FaCamera className="h-4 w-4 inline-block mr-2" /> Capture
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder={!isFollowUp ? "Describe your object..." : "Ask a follow-up question..."}
          value={isFollowUp ? followUp : object}
          onChange={(e) => (isFollowUp ? setFollowUp(e.target.value) : setObject(e.target.value))}
          className="flex-1 p-2 border rounded-md bg-[#C9DABF] text-[#5F6F65]"
        />

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="p-2 border rounded-md bg-[#4B5945] text-white"
        >
          <option value="versatile">Versatile</option>
          <option value="minimalist">Minimalist</option>
          <option value="boho">Boho</option>
          <option value="modern">Modern</option>
          <option value="rustic">Rustic</option>
        </select>

        <button onClick={() => setIsFollowUp(!isFollowUp)} className="p-2 bg-[#4B5945] text-white rounded-md">
          {isFollowUp ? "New Query" : "Follow-up"}
        </button>

        <button onClick={handleSend} disabled={loading} className="rounded-full p-2 bg-[#4B5945] text-white">
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <FaPaperPlane className="h-4 w-4" />
          )}
        </button>
      </footer>
    </div>
  )
}

export default Trial
