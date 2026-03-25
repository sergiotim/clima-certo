import { Resend } from "resend";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import pLimit from "p-limit";

import { generateWeatherEmailHtml } from "./email-template.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY") ?? "";

// Create clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is NOT set in environment variables!");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// O tier gratuito do Gemini (AI Studio) permite 15 requisições por minuto (15 RPM).
// Processamos 1 email por vez para garantir o respeito aos limites e evitar 429.
const limit = pLimit(1); 

export default async function reqHandler(req: Request) {
  // Verificação básica de Authorization (opcional, dependendo de como for chamado o cron)
  // O cron pg_net pode passar chaves secretas no header para validar a chamada

  try {
    // 1. Fetch active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("active", true);

    if (subsError) {
      throw new Error(`Error fetching subscribers: ${subsError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscribers found." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Processing ${subscribers.length} subscribers...`);

    // 2. Process each subscriber concurrently with a limit
    const results = await Promise.all(
      subscribers.map((subscriber) =>
        limit(async () => {
          try {
            // A. Fetch weather data for the city (free 2.5 API)
            const cityQuery = subscriber.city || "São Paulo";
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) {
                throw new Error(`Failed to fetch weather data for ${cityQuery}: ${weatherResponse.status}`);
            }
            const weatherData = await weatherResponse.json();

            // Extract weather info from 2.5 API response
            const currentTemp = weatherData.main?.temp;
            const weatherDesc = weatherData.weather?.[0]?.description;
            const weatherContext = `Cidade: ${cityQuery}. Temperatura atual: ${currentTemp}°C. Condições: ${weatherDesc}.`;

            // B. Generate motivational greeting with Gemini (optional — fallback if quota exceeded)
            let motivationalMessage: string;
            try {
              const prompt = `Atue como um mentor motivacional. Com base nestes dados climáticos: [ ${weatherContext} ], escreva uma saudação matinal de até 3 parágrafos que inspire o usuário a ter um dia produtivo, relacionando o clima com mindset positivo e foco. Dirija-se de forma amigável!`;
              
              // Pausa de 4 segundos para não exceder o limite gratuito de 15 RPM (Requests Per Minute) da API do Gemini
              await new Promise(resolve => setTimeout(resolve, 4000));

              // Voltando para gemini-2.5-flash conforme teste que teve sucesso anteriormente
              const aiResponse = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: [{ role: 'user', parts: [{ text: prompt }] }],
              });
              
              console.log("AI Response received successfully");
              
              motivationalMessage = aiResponse.text || `Bom dia! Hoje em ${cityQuery} estamos com ${currentTemp}°C e ${weatherDesc}. Que você tenha um excelente dia!`;
            } catch (aiErr: any) {
              console.error(`Gemini AI Error for ${subscriber.email}:`, aiErr);
              if (aiErr.stack) console.error(aiErr.stack);
              motivationalMessage = `☀️ Bom dia!\n\nHoje em ${cityQuery} estamos com ${Math.round(currentTemp)}°C e ${weatherDesc}.\n\nQue você tenha um dia produtivo e cheio de energia!`;
            }

            // C. Prepare email content
            // Assuming we have user's email and a unique JWT or UUID for unsubscribe
            // Constroi link dinâmico de descadastramento
            const appUrl = Deno.env.get("APP_URL") || "https://clima-certo.vercel.app";
            const unsubscribeLink = `${appUrl}/unsubscribe?token=${subscriber.id}`;

            const emailHtml = generateWeatherEmailHtml(
              motivationalMessage || "Que você tenha um ótimo dia!", 
              unsubscribeLink
            );

            // D. Send Email via Resend
            const { error: resendError } = await resend.emails.send({
              from: "Clima Certo <onboarding@resend.dev>", // Teste: troque para seu domínio verificado no Resend
              to: subscriber.email,
              subject: "Bom dia! Seu Clima Certo de Hoje ☀️",
              html: emailHtml,
            });

            if (resendError) throw resendError;

            return { email: subscriber.email, status: "success" };
          } catch (err: any) {
            console.error(`Failed to process subscriber ${subscriber.email}: `, err);
            return { email: subscriber.email, status: "error", error: err.message };
          }
        })
      )
    );

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

// Em Deno Deploy / Supabase Edge Runtime precisamos de um Deno.serve:
Deno.serve(reqHandler);
