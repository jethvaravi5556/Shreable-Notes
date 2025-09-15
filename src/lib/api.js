// API service for Gemini, OpenAI, and Hugging Face with fallback
// Environment variables needed:
//   VITE_GEMINI_API_KEY
//   VITE_HUGGINGFACE_API_KEY
//   VITE_OPENAI_API_KEY

import OpenAI from 'openai';

export class APIService {
  // ===== API KEY HANDLING =====
  static getGeminiKey() {
    return import.meta.env?.VITE_GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY || "";
  }

  static getHFKey() {
    return import.meta.env?.VITE_HUGGINGFACE_API_KEY || process.env?.VITE_HUGGINGFACE_API_KEY || "";
  }

  static getOpenAIKey() {
    return import.meta.env?.VITE_OPENAI_API_KEY || process.env?.VITE_OPENAI_API_KEY || "";
  }

  // ===== GEMINI REQUEST =====
  static async makeGeminiRequest(prompt) {
    const apiKey = this.getGeminiKey();
    if (!apiKey) throw new Error("Gemini API key not configured");

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
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorCode = null;
      try { errorCode = JSON.parse(errorText)?.error?.code; } catch {}
      if (errorCode === 429) throw new Error("GEMINI_QUOTA_EXCEEDED");
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates.length) throw new Error("Invalid response from Gemini API");
    return data;
  }

  // ===== OPENAI REQUEST =====
  static async makeOpenAIRequest(prompt) {
    const apiKey = this.getOpenAIKey();
    if (!apiKey) throw new Error("OpenAI API key not configured");
    
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
        });

        const text = completion.choices[0].message.content;
        return { candidates: [{ content: { parts: [{ text }] } }] };
    } catch (error) {
        if (error.status === 429) {
            throw new Error("OPENAI_QUOTA_EXCEEDED");
        }
        throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  // ===== HUGGING FACE REQUEST =====
  static async makeHFRequest(prompt, model = "gpt2") {
    const apiKey = this.getHFKey();
    if (!apiKey) throw new Error("Hugging Face API key not configured");

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (model.startsWith("Helsinki-NLP")) {
      if (!data[0]?.translation_text) throw new Error("Invalid translation response");
      return { candidates: [{ content: { parts: [{ text: data[0].translation_text }] } }] };
    }

    if (!Array.isArray(data) || !data[0]?.generated_text) {
      throw new Error("Invalid HF response for text generation");
    }

    return { candidates: [{ content: { parts: [{ text: data[0].generated_text }] } }] };
  }

  // ===== UNIFIED TEXT GENERATION =====
  static async generateText(content) {
    try {
      // 1. Try Gemini first
      return await this.makeGeminiRequest(content);
    } catch (geminiError) {
      console.warn("Gemini failed or quota exceeded, trying OpenAI:", geminiError.message);
      
      try {
        // 2. If Gemini fails, try OpenAI
        return await this.makeOpenAIRequest(content);
      } catch (openaiError) {
        // 3. If OpenAI also fails, fall back to Hugging Face
        console.warn("OpenAI failed or quota exceeded, using Hugging Face:", openaiError.message);
        return await this.makeHFRequest(content);
      }
    }
  }

  // ===== TRANSLATION =====
  static async translateText(text, language) {
    const hfModels = {
      fr: "Helsinki-NLP/opus-mt-en-fr",
      es: "Helsinki-NLP/opus-mt-en-es",
      de: "Helsinki-NLP/opus-mt-en-de",
      it: "Helsinki-NLP/opus-mt-en-it",
      pt: "Helsinki-NLP/opus-mt-en-pt",
      ja: "Helsinki-NLP/opus-mt-en-ja",
      ko: "Helsinki-NLP/opus-mt-en-ko",
      zh: "Helsinki-NLP/opus-mt-en-zh",
    };
    const model = hfModels[language] || "bigscience/bloom";

    try {
      return await this.makeHFRequest(text, model);
    } catch (err) {
      console.warn("Translation failed:", err.message);
      return { candidates: [{ content: { parts: [{ text: `[${language}] Translation unavailable: "${text}"` }] } }] };
    }
  }

  // ===== CONTENT ANALYSIS =====
  static async analyzeContent(content) {
    const prompt = `Analyze this text and return ONLY JSON with this exact structure (no extra text):
{
  "summary": "Brief summary of content",
  "tags": ["tag1","tag2","tag3"],
  "grammarIssues": [{"text":"wrong","suggestion":"correct"}],
  "glossaryTerms": [{"term":"term","definition":"definition"}],
  "insights": [
    {"title":"Writing Style","description":"style analysis"},
    {"title":"Readability","description":"readability assessment"},
    {"title":"Key Topics","description":"main topics"}
  ]
}
Text: "${content}"`;

    try {
      const response = await this.generateText(prompt);
      const textResult = response.candidates[0].content.parts[0].text;
      return JSON.parse(textResult);
    } catch (err) {
      console.warn("Content analysis failed. All APIs unavailable or returned invalid format:", err.message);
      
      // Provides a robust, hardcoded fallback
      return {
        summary: "Fallback analysis",
        tags: ["note", "content"],
        grammarIssues: [],
        glossaryTerms: [],
        insights: [{ title: "Fallback", description: "All APIs are unavailable or returned invalid data." }]
      };
    }
  }
}