import { Resend } from "resend";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";
import pLimit from "p-limit";

import { generateWeatherEmailHtml } from "./email-template.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY") ?? "";

// Create clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY is NOT set in environment variables!");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

// O tier gratuito do Groq permite em média 30 requisições por minuto (30 RPM) para o Llama 3.
// Processamos 1 email por vez com um pequeno delay para garantir estabilidade.
const limit = pLimit(1); 
const DELAY_MS = 2000; // 2 segundos de intervalo entre cada e-mail
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
            
            let motivationalMessage: string;
            try {
              const prompt = `Atue como um mentor motivacional. Com base nestes dados climáticos: [ ${weatherContext} ], escreva uma saudação matinal de até 3 parágrafos que inspire o usuário a ter um dia produtivo, relacionando o clima com mindset positivo e foco. Dirija-se de forma amigável!`;
              
              // Pequeno delay para respeitar o limite de taxa do Groq
              await new Promise(resolve => setTimeout(resolve, DELAY_MS));

              const chatCompletion = await groq.chat.completions.create({
                messages: [
                  { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
              });
              
              console.log("Groq Response received successfully");
              
              motivationalMessage = chatCompletion.choices[0]?.message?.content || `Bom dia! Hoje em ${cityQuery} estamos com ${currentTemp}°C e ${weatherDesc}. Que você tenha um excelente dia!`;
            } catch (aiErr: any) {
              console.error(`Groq AI Error for ${subscriber.email}:`, aiErr);
              if (aiErr.stack) console.error(aiErr.stack);
              motivationalMessage = `☀️ Bom dia!\n\nHoje em ${cityQuery} estamos com ${Math.round(currentTemp)}°C e ${weatherDesc}.\n\nQue você tenha um dia produtivo e cheio de energia!`;
            }

            // C. Prepare email content
            // Assuming we have user's email and a unique JWT or UUID for unsubscribe
            // Constroi link dinâmico de descadastramento
            const appUrl = Deno.env.get("APP_URL") || "https://climacerto.vercel.app";
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
