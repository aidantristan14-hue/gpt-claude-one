import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Add GROQ_API_KEY to .env.local, then restart the app." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) {
    return NextResponse.json({ error: "Send a messages array." }, { status: 400 });
  }

  const messages = (body as { messages: unknown[] }).messages;
  if (messages.length < 1 || messages.length > 40) {
    return NextResponse.json({ error: "Send between 1 and 40 messages." }, { status: 400 });
  }
  const valid = messages.every((message) => {
    if (!message || typeof message !== "object") return false;
    const item = message as Partial<ChatMessage>;
    return (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" && item.content.length <= 20000;
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid message format or message too long." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages,
      }),
      signal: AbortSignal.timeout(60000),
    });

    const result: unknown = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Groq rejected the API key. Check GROQ_API_KEY in .env.local." }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "Groq rate or usage limit reached. Check your Groq account limits and try again later." }, { status: 429 });
      }
      console.error("Groq API returned status", response.status);
      return NextResponse.json({ error: "Groq could not complete the request. Check the configured model and try again." }, { status: 502 });
    }

    const data = result as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string") {
      return NextResponse.json({ error: "Groq returned an empty or unexpected response." }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Groq request failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Could not reach Groq. Check your internet connection and try again." }, { status: 502 });
  }
}
