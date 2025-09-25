import fetch from "node-fetch";

export async function handler(event, context) {
  const { prompt } = JSON.parse(event.body);

  // List of Gemini API keys
  const geminiKeys = [
    process.env.VITE_GEMINI_API_KEY_1,
    process.env.VITE_GEMINI_API_KEY_2,
    process.env.VITE_GEMINI_API_KEY_3,
    process.env.VITE_GEMINI_API_KEY_4,
  ].filter(Boolean);

  if (!geminiKeys.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No Gemini API keys configured" }),
    };
  }

  const modelName = "gemini-1.5-flash";

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  };

  // Try each key in sequence
  for (let i = 0; i < geminiKeys.length; i++) {
    const apiKey = geminiKeys[i];
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok && data?.candidates?.length) {
        return {
          statusCode: 200,
          body: JSON.stringify(data),
        };
      } else {
        console.warn(
          `Gemini key ${i + 1} failed:`,
          data?.error || "Unknown error"
        );
        continue; // try next key
      }
    } catch (err) {
      console.warn(`Gemini key ${i + 1} request error:`, err.message);
      continue; // try next key
    }
  }

  // If all keys fail
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: "All Gemini API keys failed or quota exceeded",
    }),
  };
}
