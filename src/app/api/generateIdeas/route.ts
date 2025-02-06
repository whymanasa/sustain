import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { object, style } = await req.json();

    if (!object) {
      return NextResponse.json({ message: "Please provide an object name." }, { status: 400 });
    }

    const prompt = `You are an expert in sustainable upcycling and creative reuse ideas. Your goal is to provide **eco-friendly, upcycled, and waste-reducing solutions** for old objects. Ensure your responses are **structured, detailed, and easy to follow**.

    ## Task:
    Suggest **at least three creative and practical reuse ideas** for an old ${object}. Ideas should be in a ${style || "versatile"} style while remaining sustainable. Ensure each idea includes:
    1. **Idea Name** (Catchy and descriptive)
    2. **Purpose** (Why it’s useful and how it benefits the environment)
    3. keep them short
    
    Provide ideas that are **simple, practical, and environmentally responsible**.`;
    

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


