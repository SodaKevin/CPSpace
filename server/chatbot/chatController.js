import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

import { keywordSafetyCheck, openAISafetyCheck } from "./safetyFilter.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithAI(req, res) {
  try {
    console.log("🚨 chatWithAI HANDLER ENTERED");

    console.log("📩 Chat request:", req.body);

    const { message, history = [], tone } = req.body;
    
    console.log("🧪 MESSAGE TYPE:", typeof message);

    if (typeof message !== "string") {
      console.error("❌ MESSAGE IS NOT STRING, ABORTING");
    }

    const isKeywordRisk = keywordSafetyCheck(message);
    console.log("🔴 KEYWORD RISK:", isKeywordRisk);

    let isOpenAIRisk = false;

    try {
      isOpenAIRisk = await openAISafetyCheck(openai, message);
      console.log("🟠 OPENAI RISK:", isOpenAIRisk);
    } catch (err) {
      console.error("⚠️ OpenAI safety check failed:", err);
    }

    let riskLevel = "LOW";

    if (isKeywordRisk) {
      riskLevel = "HIGH";
    } else if (isOpenAIRisk) {
      riskLevel = "MODERATE";
    }

    let copingSuggestions = [];

    if (riskLevel === "LOW" || riskLevel === "MODERATE") {
      copingSuggestions = ["SHOW_COPING_HUB"];
    }

    let finalUserMessage = message;

    if (isKeywordRisk) {
      return res.json({
        reply: `
        I'm really sorry that you're feeling this overwhelmed.
        You don't have to go through this alone.

        If you're in immediate danger, please call your local emergency number right now.

        In Malaysia, you can contact:
        • Befrienders KL: 03-7627 2929
        • Befrienders Penang: 04-291 0100
        • https://findahelpline.com

        If possible, please reach out to someone you trust nearby.
        `.trim(),

        riskLevel: "HIGH",
        suggestCopingHub: true
      });
    }

    if (isOpenAIRisk) {
      finalUserMessage = `
      The user may be experiencing emotional distress or thoughts of self-harm.
      Respond empathetically and calmly.
      Encourage seeking support from trusted people or local help services.
      Encourage contacting emergency services or suicide prevention hotlines if appropriate.
      Do NOT provide instructions or methods.
      Do NOT normalize self-harm.

    User message:
    "${message}"
      `.trim();
    }

    const allowedTones = ["casual", "friendly", "professional"];

    const safeTone = allowedTones.includes(tone)
      ? tone
      : "casual";

    let toneInstruction = "";

    if (safeTone === "casual") {
      toneInstruction = `
    Use a casual, relaxed, conversational tone.
    Speak like a supportive friend, not a therapist.
    Use simple language and contractions (e.g., "you're", "it's okay").
    Keep sentences short and natural.
    Avoid formal phrasing or clinical terms.
    Ask gentle, open-ended questions.
    Do NOT sound robotic or overly professional.
    `.trim();
    }
    else if (safeTone === "professional") {
      toneInstruction = `
    Use a calm, respectful, and professional tone.
    Sound composed, thoughtful, and structured.
    Use clear, well-formed sentences.
    Avoid slang, emojis, or overly casual expressions.
    Focus on clarity, emotional regulation, and gentle guidance.
    Maintain emotional distance while remaining supportive.
    `.trim();
    }
    else if (safeTone === "friendly") {
      toneInstruction = `
    Use a warm, friendly, and encouraging tone.
    Be emotionally validating and reassuring.
    Acknowledge the user's feelings explicitly.
    Use supportive phrases like "That sounds really tough" or "I'm glad you shared this."
    Maintain a calm, positive, and caring style.
    Do NOT be overly casual or overly formal.
    `.trim();
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
            You are an AI mental wellness companion.
            ${toneInstruction}
            Respond with empathy and emotional support.
            Do NOT provide medical diagnosis.
            Do NOT encourage self-harm.
            Encourage healthy coping strategies gently.
            If user shows distress, respond calmly and supportively.
          `.trim(),
        },
        ...history,
        {
          role: "user",
          content: finalUserMessage,
        },
      ],
    });

    const reply = response.output_text;

    console.log("🤖 AI reply:", reply);

    res.json({
      reply,
      riskLevel,
      copingSuggestions
    });
  } catch (err) {
    console.error("❌ AI ERROR:", err);
    res.status(500).json({ error: "AI response failed" });
  }
}

export async function generateChatTitle(req, res) {
  try {
    const { message } = req.body;

    console.log("📝 Generating AI title for:", message);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a short, natural chat title (3–6 words) that summarizes the user's emotional topic. Do NOT use quotes. Do NOT use emojis.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.5,
      max_tokens: 20,
    });

    const title = response.choices[0].message.content.trim();

    res.json({ title });
  } catch (err) {
    console.error("Title generation error:", err);
    res.status(500).json({ error: "Failed to generate title" });
  }
}
