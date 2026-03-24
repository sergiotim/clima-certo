import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Qual é a capital do Brasil?",
    });
    console.log("Success:", aiResponse.text);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
