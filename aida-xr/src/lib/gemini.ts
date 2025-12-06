import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the new SDK
// Note: For production, use environment variables only
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCxQFVzQv4kpOFNG-C_DtmFEXwtJzP9nxo";

if (!GEMINI_API_KEY) {
  console.error("⚠️ GEMINI_API_KEY not set!");
}

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
