import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

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
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const visionResponse = await fetch(
          "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HUGGINGIMAGE_API_KEY}`,
              "Content-Type": "application/octet-stream",
            },
            body: buffer,
          }
        );

        if (!visionResponse.ok) {
          throw new Error(await visionResponse.text());
        }

        const visionData = await visionResponse.json();
        detectedObject = visionData[0]?.generated_text?.trim() || "unknown object";
        console.log("BLIP-2 Detected Object:", detectedObject);
      } catch (error) {
        console.error("Image processing error:", error);
        return NextResponse.json({ message: "Error processing image" }, { status: 500 });
      }
    }

    console.log("Generated Prompt:", prompt);

    const chatCompletion = await client.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        {
          role: "system",
          content: "You are a top expert in sustainable upcycling and creative reuse."
        },
        {
          role: "user",
          content: followUp && previousQuery && previousResponse
            ?  `The user previously asked: "${previousQuery}"\nYou responded: "${previousResponse}"\nNow the user is asking a follow-up: "${followUp}"

            Provide a helpful response that builds on the previous answer. Keep your answer **short and concise** (100-150 words), while staying within the context of **sustainable upcycling and reuse**. The response should remain **simple, beginner-friendly, and practical**, and add value by providing **easy, creative solutions** that can inspire the user to take action.`
            : `Your task is to suggest **three simple, beginner-friendly, and eco-friendly ways** to repurpose an old ${detectedObject}. The ideas should be in a ${style} style while keeping sustainability at the core. 
        
        ## Guidelines:
        - **Keep the ideas simple** and creative, using minimal materials and easy-to-follow steps.
        - Each idea should include:
          1. A **catchy title** that's engaging.
          2. A **short description** that explains how to repurpose the item.
        
        - Avoid complex DIY techniques—focus on **easy, creative solutions** that anyone can make.
          
        ### Example Output Format:
        1. **Glowing Jar Lantern** – Place fairy lights inside for a cozy night lamp.
        2. **Upcycled Pencil Holder** – Decorate and use for storing pens or pencils.
        3. **Mini Herb Planter** – Fill with soil and grow fresh herbs on your windowsill.
        
        ### Important :
        
        - After presenting the three ideas, end with a **positive, motivating message** that encourages the user to get creative and keep exploring upcycling options in 10-15 words. 
        - Make the response feel **light, inspiring, and fun**—encourage the user to experiment with their own ideas and feel empowered to repurpose items creatively while including !`
        }
      ],
      provider: "hf-inference",
      max_tokens: 500,
    });

    const ideas = chatCompletion.choices[0].message.content;
    return NextResponse.json({ detectedObject, ideas });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
