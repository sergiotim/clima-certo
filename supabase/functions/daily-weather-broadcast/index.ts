import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";
import { generateWeatherEmailHtml } from "./email-template.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const BREVO_SENDER_EMAIL = Deno.env.get("BREVO_SENDER_EMAIL") ?? "suporte.climacerto@gmail.com";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY") ?? "";
const UNSUBSCRIBE_TOKEN_SECRET = Deno.env.get("UNSUBSCRIBE_TOKEN_SECRET") ?? "";
const FUNCTION_AUTH_TOKEN = Deno.env.get("FUNCTION_AUTH_TOKEN") ?? "";

// Create clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY is NOT set in environment variables!");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

const DELAY_MS = 2000; // 2 seconds between Groq calls

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

async function createUnsubscribeToken(subscriberId: string): Promise<string> {
  if (!UNSUBSCRIBE_TOKEN_SECRET) {
    // Backward compatible fallback until secret is configured.
    return subscriberId;
  }

  const payload = {
    sub: subscriberId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };

  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signPayload(encodedPayload, UNSUBSCRIBE_TOKEN_SECRET);
  return `${encodedPayload}.${signature}`;
}

/**
 * Sends a transactional email via Brevo API v3
 */
async function sendBrevoEmail(to: { email: string; name?: string }, subject: string, htmlContent: string) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Clima Certo", email: BREVO_SENDER_EMAIL },
      to: [to],
      subject: subject,
      htmlContent: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
  }
  
  return response.json();
}

interface Subscriber {
  id: string;
  email: string;
  city: string;
  country?: string;
  active: boolean;
}

interface Result {
  email: string;
  city: string;
  status: "success" | "error";
  error?: string;
}

export default async function reqHandler(request: Request) {
  try {
    if (FUNCTION_AUTH_TOKEN) {
      const authorization = request.headers.get("authorization") ?? "";
      const expected = `Bearer ${FUNCTION_AUTH_TOKEN}`;
      if (authorization !== expected) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { "Content-Type": "application/json" },
          status: 401,
        });
      }
    }

    // 1. Fetch active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("active", true);

    if (subsError) {
      throw new Error(`Error fetching subscribers: ${subsError.message}`);
    }

    const typedSubscribers = subscribers as Subscriber[];

    if (!typedSubscribers || typedSubscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscribers found." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Processing ${typedSubscribers.length} total subscribers...`);

    // 2. Group subscribers by city to optimize API usage
    const subscribersByCity: Record<string, Subscriber[]> = {};
    typedSubscribers.forEach(sub => {
      const city = sub.city || "São Paulo";
      if (!subscribersByCity[city]) subscribersByCity[city] = [];
      subscribersByCity[city].push(sub);
    });

    const results: Result[] = [];
    const appUrl = Deno.env.get("APP_URL") || "https://climacerto.vercel.app";

    // 3. Process each city group
    for (const [city, citySubscribers] of Object.entries(subscribersByCity)) {
      console.log(`Processing city: ${city} (${citySubscribers.length} subscribers)`);
      
      try {
        // A. Fetch weather data once for the city
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
           throw new Error(`Failed to fetch weather data for ${city}: ${weatherResponse.status}`);
        }
        const weatherData = await weatherResponse.json();

        const currentTemp = weatherData.main?.temp;
        const weatherDesc = weatherData.weather?.[0]?.description;
        
        // B. Generate AI message once for the city
        let motivationalMessage: string;
        try {
          // Delay to respect Groq rate limits between different cities
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));

          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "user",
                content: `Escreva em portugues do Brasil para uma newsletter matinal de clima.\n\nUse os dados completos da OpenWeather abaixo para criar uma mensagem realmente util para o dia a dia:\n${JSON.stringify(weatherData)}\n\nRegras obrigatorias:\n- tom humano, amigavel e objetivo\n- ate 2 paragrafos\n- inclua dicas praticas para hoje (roupa, hidratacao, deslocamento, guarda-chuva ou protetor solar quando fizer sentido)\n- conecte o clima com uma motivacao leve, sem frases genericas\n- nao use HTML\n- nao invente dados que nao estao no JSON`,
              },
            ],
            model: "llama-3.3-70b-versatile",
          });
          
          motivationalMessage = (chatCompletion.choices[0]?.message?.content || "").trim();
          
          if (!motivationalMessage) throw new Error("Empty message from Groq");
          
          console.log(`Groq message generated for ${city}`);
        } catch (aiErr: unknown) {
          const errorMessage = aiErr instanceof Error ? aiErr.message : "Unknown AI error";
          console.error(`Groq AI Error for city ${city}:`, errorMessage);
          motivationalMessage = `☀️ Bom dia! Hoje em ${city} estamos com ${Math.round(currentTemp)}°C e ${weatherDesc}.\n\nRespire fundo, organize suas prioridades e avance com constancia. Bom dia produtivo para voce!`;
        }

        // C. Send individual emails to all subscribers in this city
        for (const subscriber of citySubscribers) {
          try {
            const unsubscribeToken = await createUnsubscribeToken(subscriber.id);
            const unsubscribeLink = `${appUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
            const emailHtml = generateWeatherEmailHtml({
              message: motivationalMessage,
              unsubscribeLink,
              city,
              weatherData,
            });

            await sendBrevoEmail(
              { email: subscriber.email }, 
              "Bom dia! Seu Clima Certo de Hoje ☀️", 
              emailHtml
            );

            results.push({ email: subscriber.email, city, status: "success" });
          } catch (emailErr: unknown) {
            const errorMessage = emailErr instanceof Error ? emailErr.message : "Unknown email error";
            console.error(`Failed to send email to ${subscriber.email}: `, errorMessage);
            results.push({ email: subscriber.email, city, status: "error", error: errorMessage });
          }
        }
      } catch (cityErr: unknown) {
        const errorMessage = cityErr instanceof Error ? cityErr.message : "Unknown city error";
        console.error(`Critical error processing city ${city}:`, errorMessage);
        // Mark all subscribers in this city as failed
        citySubscribers.forEach(sub => {
          results.push({ email: sub.email, city, status: "error", error: errorMessage });
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    console.error("Function overall error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

// Supabase Edge Runtime entry point
Deno.serve(reqHandler);
