import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as Blob | null;
    const textInput = formData.get("object") as string | null;
    const style = formData.get("style") as string || "versatile";

    let detectedObject = textInput || ""; // Use text if provided

    // ✅ If an image is uploaded, send it as binary to Hugging Face
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer()); // Convert to Buffer


      const visionResponse = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGIMAGE_API_KEY}`, // ✅ Use Hugging Face key
          },
          body: buffer, // ✅ Send raw binary image
        }
      );

      if (!visionResponse.ok) {
        const errorText = await visionResponse.text();
        console.error("Hugging Face API Error:", errorText);
        return NextResponse.json({ message: "Error processing image", error: errorText }, { status: 500 });
      }

      const visionData = await visionResponse.json();
      detectedObject = visionData?.[0]?.generated_text?.trim() || "unknown object"; // ✅ Extract caption

    }

    if (!detectedObject || detectedObject === "unknown object") {
      return NextResponse.json({ message: "Couldn't identify the object. Try again with a clearer image or provide text input." }, { status: 400 });
    }

    // ✅ Generate upcycling ideas using the detected object
    const aiPrompt = `You are an expert in sustainable upcycling and creative reuse ideas. Your goal is to suggest **three simple, beginner-friendly, and eco-friendly ways** to repurpose an old ${detectedObject}. Ideas should be in a ${style} style while remaining sustainable. 

    ## Instructions:
    - Keep the ideas **short, clear, and easy to make**.
    - Each idea should have a **catchy title** and a **one-line description** explaining how to reuse the item.
    - Avoid complex DIY methods—focus on **minimal materials and simple steps**.
    
    ## Example Output Format:
    1. **Jar Lantern** – Add fairy lights inside for a night lamp.  
    2. **DIY Pencil Holder** – Decorate and store pens/pencils.  
    3. **Herb Garden** – Fill with soil and grow small herbs.
    
    ### Important:
    After suggesting the three ideas, **end your response** with a **positive and encouraging tone**.
    
    The goal is to leave the user feeling **motivated**, **encouraged**, and **ready to ask more questions** or request further suggestions.
    `;
    console.log("Sending prompt to AI model...");
    const aiResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: aiPrompt, parameters: { max_new_tokens: 2000, temperature: 0.7, top_p: 0.9 } }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ message: "AI request failed", error: await aiResponse.text() }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    return NextResponse.json({ detectedObject, ideas: aiData[0]?.generated_text || "No ideas found." });

  } catch (error: unknown) {
    console.error("Server error:", error);
    return NextResponse.json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
