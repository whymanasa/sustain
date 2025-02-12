import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const followUp = formData.get("followUp") as string | null;
    const previousQuery = formData.get("previousQuery") as string | null;
    const previousResponse = formData.get("previousResponse") as string | null;
    const object = formData.get("object") as string | null;
    const style = formData.get("style") as string || "versatile";
    const image = formData.get("image") as Blob | null;
    
    let detectedObject = object || ""; // If object text is provided, use it
    let prompt = "";

    // ✅ If an image is uploaded, process it using BLIP-2
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());

      console.log("Sending image to Hugging Face BLIP-2...");

      const visionResponse = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGIMAGE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: buffer }), // Send raw image data
        }
      );

      if (!visionResponse.ok) {
        const errorText = await visionResponse.text();
        console.error("BLIP-2 API Error:", errorText);
        return NextResponse.json({ message: "Error processing image", error: errorText }, { status: 500 });
      }

      const visionData = await visionResponse.json();
      detectedObject = visionData?.[0]?.generated_text?.trim() || "unknown object";
      console.log("BLIP-2 Detected Object:", detectedObject);
    }

    // ✅ If a follow-up question is detected, maintain context
    if (followUp && previousQuery && previousResponse) {
      prompt = `You are an expert in sustainable upcycling and creative reuse ideas. 

      The user previously asked: "${previousQuery}" 
      You responded: "${previousResponse}"

      Now the user is asking a follow-up: "${followUp}" 

      Provide a helpful response that builds upon the previous answer while staying within sustainable upcycling and reuse. 
      Ensure the answer remains simple, beginner-friendly, and practical.`;
    } else if (detectedObject) {
      // ✅ New query (image or text-based)
      prompt = `You are a top expert in sustainable upcycling and creative reuse. Your task is to suggest three simple, beginner-friendly, and eco-conscious ways to repurpose an old ${detectedObject} in a ${style} style, while keeping sustainability at the core.

### ✨ Instructions:
- Keep ideas short, practical, and easy to follow.
- Each idea must have:
  1. A catchy title (engaging and fun).
  2. A two-line description explaining how to repurpose the item.
- Focus on minimal materials and simple steps—avoid complex DIY techniques.

### 📌 Example Output Format:
1. **Glowing Jar Lantern** – Place fairy lights inside for a cozy night lamp.
2. **Eco-Friendly Pencil Holder** – Decorate and use for organizing stationery.
3. **Mini Herb Planter** – Add soil and grow fresh herbs on your windowsill.

`}

    console.log("Generated Prompt:", prompt);

    const aiResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ message: "AI request failed", error: await aiResponse.text() }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const ideas = aiData[0]?.generated_text || "No ideas found.";
    return NextResponse.json({ detectedObject, ideas});
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
