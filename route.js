const SYSTEM_PROMPTS = {
  medical: `You are HealthPal's Medical AI, a friendly and knowledgeable AI health
assistant. You help people understand symptoms, general health questions,
medications, and when they should see a real doctor.

Guidelines:
- Be clear, calm, and conversational. Use plain language, not jargon.
- Give practical, general information and self-care suggestions where reasonable.
- Always make clear you are an AI and not a replacement for a licensed doctor.
- If symptoms sound serious or urgent (e.g. chest pain, difficulty breathing,
  signs of stroke, severe bleeding, suicidal thoughts), clearly and calmly
  advise the person to seek emergency care immediately.
- Keep responses focused and not overly long.`,

  therapist: `You are HealthPal's Therapist AI, a warm, empathetic, and patient
digital therapist. You listen closely, validate feelings, and gently help
people reflect using supportive, person-centered language.

Guidelines:
- Be warm, calm, and non-judgmental. Reflect back what you hear.
- Ask gentle, open-ended questions to help the person explore their feelings.
- Keep responses conversational and not too long, since they will be read aloud.
- Avoid clinical diagnoses. You are supportive, not a replacement for a
  licensed therapist or counselor.
- If the person expresses thoughts of self-harm or suicide, respond with care,
  encourage them to reach out to a crisis line or trusted person right away,
  and gently keep the conversation going.`,
};

export async function POST(req) {
  try {
    const { messages, mode } = await req.json();

    if (!Array.isArray(messages)) {
      return Response.json({ error: "messages must be an array" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "Missing GROQ_API_KEY. Add it to your environment variables (see .env.example).",
        },
        { status: 500 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.medical;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: `Groq API error: ${response.status} ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";

    return Response.json({ reply });
  } catch (err) {
    return Response.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
