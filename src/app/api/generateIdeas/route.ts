import { NextResponse } from "next/server";

// API must use the 'POST' method
export async function POST(req: Request) {
  try {
    const { object, style } = await req.json();

    if (!object) {
      return NextResponse.json({ message: "Please provide an object name." }, { status: 400 });
    }

    // Generate structured prompt
    const prompt = `I have an old ${object}. Suggest sustainable reuse ideas${
      style ? ` in a ${style} style` : ""
    }. Ensure the ideas are eco-friendly, upcycled, or reduce waste. Provide step-by-step instructions.`;

    const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ message: "AI request failed", error: data.error }, { status: 500 });
    }

    return NextResponse.json({ ideas: data[0]?.generated_text || "No ideas generated." });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: "Server error", error: errorMessage }, { status: 500 });
  }
}
