// api-proxy.js (serverless function, e.g., Netlify or Vercel)
import fetch from "node-fetch";
import OpenAI from "openai";

const GEMINI_KEYS = [
  process.env.VITE_GEMINI_API_KEY_1,
  process.env.VITE_GEMINI_API_KEY_2,
  process.env.VITE_GEMINI_API_KEY_3,
  process.env.VITE_GEMINI_API_KEY_4,
].filter(Boolean);

let currentGeminiIndex = 0;

function getGeminiKey() {
  const key = GEMINI_KEYS[currentGeminiIndex];
  currentGeminiIndex = (currentGeminiIndex + 1) % GEMINI_KEYS.length;
  return key;
}

const OPENAI_KEY = process.env.VITE_OPENAI_API_KEY;
const HF_KEY = process.env.VITE_HUGGINGFACE_API_KEY;

export async function handler(event, context) {
  const { prompt, service = "gemini" } = JSON.parse(event.body);

  // --- Gemini Request ---
  if (service === "gemini") {
    if (!GEMINI_KEYS.length)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No Gemini keys configured" }),
      };

    const model = "gemini-1.5-flash";
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const apiKey = getGeminiKey();
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          const code = JSON.parse(errText)?.error?.code;
          if (code === 429) continue; // try next key
          throw new Error(`Gemini error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        if (!data.candidates?.length)
          throw new Error("Invalid Gemini response");
        return { statusCode: 200, body: JSON.stringify(data) };
      } catch (err) {
        console.warn(`Gemini key failed: ${apiKey}`, err.message);
        continue;
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "All Gemini keys failed" }),
    };
  }

  // --- OpenAI Request ---
  if (service === "openai") {
    if (!OPENAI_KEY)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OpenAI key not configured" }),
      };

    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      });
      const text = completion.choices[0].message.content;
      return {
        statusCode: 200,
        body: JSON.stringify({
          candidates: [{ content: { parts: [{ text }] } }],
        }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // --- Hugging Face Request ---
  if (service === "hf") {
    if (!HF_KEY)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Hugging Face key not configured" }),
      };

    const model = "bigscience/bloomz-560m";
    try {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        return { statusCode: res.status, body: errText };
      }

      const data = await res.json();
      if (!Array.isArray(data) || !data[0]?.generated_text)
        throw new Error("Invalid HF response");
      return {
        statusCode: 200,
        body: JSON.stringify({
          candidates: [
            { content: { parts: [{ text: data[0].generated_text }] } },
          ],
        }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Unknown service" }),
  };
}
