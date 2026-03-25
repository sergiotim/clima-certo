import Groq from "groq-sdk";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Diga 'Olá Groq!'" }],
      model: "llama-3.3-70b-versatile",
    });
    console.log("Success:", chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
