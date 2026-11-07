import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ModelChoice = "auto" | "groq" | "claude";
type Provider = "groq" | "claude";

function chooseProvider(messages: ChatMessage[]): Provider {
  const latest = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  return /\b(write|rewrite|draft|story|essay|summari[sz]e|proofread)\b/i.test(latest) || latest.length > 4000
    ? "claude"
    : "groq";
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { messages, model } = body as { messages?: unknown; model?: unknown };
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 40) {
      return NextResponse.json({ error: "Send between 1 and 40 messages." }, { status: 400 });
    }
    if (model !== "auto" && model !== "groq" && model !== "claude") {
      return NextResponse.json({ error: "Choose Auto, Groq, or Claude." }, { status: 400 });
    }
    const valid = messages.every((m) => m && typeof m === "object" &&
      ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
      typeof (m as ChatMessage).content === "string" && (m as ChatMessage).content.length <= 20000);
    if (!valid) return NextResponse.json({ error: "Invalid message format or message too long." }, { status: 400 });

    const chatMessages = messages as ChatMessage[];
    const provider: Provider = model === "auto" ? chooseProvider(chatMessages) : model;
    let reply: string;
    if (provider === "groq") {
      if (!process.env.GROQ_API_KEY) return NextResponse.json({ error: "Add GROQ_API_KEY to .env.local." }, { status: 503 });
      const client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const result = await client.chat.completions.create({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: chatMessages,
      });
      reply = result.choices[0]?.message?.content ?? "";
    } else {
      if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Add ANTHROPIC_API_KEY to .env.local." }, { status: 503 });
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const result = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: chatMessages.map(({ role, content }) => ({ role, content })),
      });
      reply = result.content.filter((part) => part.type === "text").map((part) => part.text).join("");
    }
    return NextResponse.json({ reply, provider });
  } catch (error) {
    console.error("Chat request failed:", error);
    return NextResponse.json({ error: "Chat request failed. Check your API key, model name, and provider account." }, { status: 500 });
  }
}
