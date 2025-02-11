import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { object, style } = await req.json();

    if (!object) {
      return NextResponse.json({ message: "Please provide an object name." }, { status: 400 });
    }

    const prompt = `You are an expert in sustainable upcycling and creative reuse ideas. Your goal is to suggest **three simple, beginner-friendly, and eco-friendly ways** to repurpose an old ${object}. Ideas should be in a ${style || "versatile"} style while remaining sustainable. 

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
    

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000, // More tokens to generate a complete response
          temperature: 0.7, // More creative responses
          top_p: 0.9, // Better diversity in output
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "AI request failed", error: await response.text() }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ ideas: data[0]?.generated_text || "No ideas generated." });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}


