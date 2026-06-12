"use client";

import { useEffect, useRef, useState } from "react";

const WELCOME =
  "Hi, I am glad you are here. This is a calm space to talk through whatever is on your mind. You can type, or tap the microphone and speak to me. How are you feeling today?";

export default function TherapistPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [speakEnabled, setSpeakEnabled] = useState(true);

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current.start();
    }
  }

  function speak(text) {
    if (!speakEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1.02;
    window.speechSynthesis.speak(utterance);
  }

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
          mode: "therapist",
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
      speak(data.reply);
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
        <span className="eyebrow">Therapist AI</span>
        <h1>A space to talk it through.</h1>
        <p>
          Speak or type freely. Your Therapist AI listens, reflects, and
          responds out loud with empathetic, spoken support.
        </p>
      </div>

      <div className="disclaimer">
        HealthPal's Therapist AI offers supportive conversation, not therapy
        from a licensed professional. If you are in crisis or thinking about
        harming yourself, please contact a local crisis line or emergency
        services right away.
      </div>

      <div className="chat-shell">
        <div className="chat-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={"msg " + m.role}>
              {m.content}
            </div>
          ))}
          {loading && <div className="msg system-note">Listening and thinking...</div>}
          {error && <div className="msg system-note">{error}</div>}
        </div>
        <div className="chat-input-row">
          {voiceSupported && (
            <button
              className={"btn btn-ghost btn-mic " + (listening ? "listening" : "")}
              onClick={toggleListening}
              title={listening ? "Stop listening" : "Speak"}
              type="button"
            >
              {listening ? "Listening" : "Speak"}
            </button>
          )}
          <textarea
            rows={1}
            placeholder="Share what is on your mind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-coral" onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>

      <label className="speak-toggle">
        <input
          type="checkbox"
          checked={speakEnabled}
          onChange={(e) => {
            setSpeakEnabled(e.target.checked);
            if (!e.target.checked && typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          }}
        />
        Read responses out loud
      </label>

      {!voiceSupported && (
        <p className="voice-note">
          Voice input is not supported in this browser. Try Chrome on
          desktop or Android for speech-to-text. Typed chat and spoken
          replies still work everywhere.
        </p>
      )}
    </main>
  );
}
