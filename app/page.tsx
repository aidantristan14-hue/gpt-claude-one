"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type ModelChoice = "auto" | "groq" | "claude";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ModelChoice>("auto");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, model }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach the chat service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar"><a className="brand" href="/">✳ one<span>.</span></a><span>Your AI, your choice</span></header>
      <section className="chat" aria-label="Chat">
        {messages.length === 0 ? <div className="welcome"><div className="welcome-icon">✳</div><p className="eyebrow">ONE CHAT. TWO MODELS.</p><h1>What can I help<br />you with?</h1><p className="muted">Chat with Groq or Claude — or let Auto choose.</p></div> :
          <div className="messages" aria-live="polite">{messages.map((message, i) => <article className={`message ${message.role}`} key={i}><div className="label">{message.role === "user" ? "You" : "One"}</div><p>{message.content}</p></article>)}{busy && <p className="muted">Thinking…</p>}</div>}
        {error && <p className="error" role="alert">{error}</p>}
      </section>
      <form className="composer" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor="message">Message</label>
        <textarea id="message" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder="Ask anything…" rows={2} maxLength={20000} disabled={busy} />
        <div className="composer-footer"><label><span className="sr-only">Choose a model</span><select value={model} onChange={(e) => setModel(e.target.value as ModelChoice)} disabled={busy}><option value="auto">✳ Auto</option><option value="groq">Groq</option><option value="claude">Claude</option></select></label><button type="submit" disabled={busy || !input.trim()} aria-label="Send">↑</button></div>
      </form>
      <p className="fine-print">AI can make mistakes. Check important information.</p>
    </main>
  );
}
