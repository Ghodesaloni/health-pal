"use client";

import { useEffect, useRef, useState } from "react";

const WELCOME =
  "Hi, I am your Medical AI. Tell me what's going on - your symptoms, how long you've had them, anything that helps - and I'll do my best to help you understand what might be happening and what to do next.";

export default function MedicalPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "medical",
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="shell">
      <div className="tool-header">
        <span className="eyebrow">Medical AI</span>
        <h1>Tell me how you are feeling.</h1>
        <p>
          Describe your symptoms and HealthPal's Medical AI will walk through
          possibilities, self-care steps, and when it's time to see a doctor.
        </p>
      </div>

      <div className="disclaimer">
        HealthPal's Medical AI is not a doctor and does not provide a
        diagnosis. For emergencies, call your local emergency number
        immediately.
      </div>

      <div className="chat-shell">
        <div className="chat-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="msg system-note">Thinking...</div>}
          {error && <div className="msg system-note">{error}</div>}
        </div>
        <div className="chat-input-row">
          <textarea
            rows={1}
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-coral" onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
