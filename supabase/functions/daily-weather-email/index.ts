import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@3.2.0";

// Define Types
interface Subscription {
  id: string;
  email: string;
  city: string;
  active: boolean;
}

serve(async (req) => {
  try {
    // 1. Initialize Clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_API_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;
    const weatherApiKey = Deno.env.get("WEATHER_API_KEY")!;

    // 2. Fetch Active Subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("active", true);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscriptions found." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];

    // 3. Process each subscription
    for (const sub of subscriptions as Subscription[]) {
      try {
        // a) Fetch Weather Data (Using OpenWeatherMap as example)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          sub.city
        )}&appid=${weatherApiKey}&units=metric&lang=pt_br`;
        
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) {
          throw new Error(`Weather API returned ${weatherRes.status} for city ${sub.city}`);
        }
        const weatherData = await weatherRes.json();
        const weatherDesc = weatherData.weather[0].description;
        const temp = Math.round(weatherData.main.temp);
        const feelsLike = Math.round(weatherData.main.feels_like);
        const humidity = weatherData.main.humidity;

        const climaString = `Condição: ${weatherDesc}, Temperatura: ${temp}°C, Sensação Térmica: ${feelsLike}°C`;

        // b) Prompt for Gemini AI
        const prompt = `Com base nos dados [${climaString}], escreva uma mensagem motivacional curta e inspiradora para começar o dia do usuário. O tom deve ser encorajador.`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
          }),
        });

        if (!geminiRes.ok) {
          throw new Error(`Gemini API returned ${geminiRes.status}`);
        }
        const geminiData = await geminiRes.json();
        const motivacional =
          geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Tenha um excelente dia cheio de realizações!";

        // c) Compose HTML Template
        const unsubscribeUrl = `https://seu-dominio.com/unsubscribe?email=${encodeURIComponent(sub.email)}`;
        
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h1 style="color: #2563eb; text-align: center;">Bom dia! Seu Clima Certo 🌤️</h1>
            <p style="font-size: 16px;">Aqui está a previsão de hoje para <strong>${sub.city}</strong>:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="margin: 0; font-size: 32px; color: #1f2937;">${temp}°C</h2>
              <p style="margin: 5px 0 0 0; font-size: 18px; text-transform: capitalize; color: #4b5563;">${weatherDesc}</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Sensação térmica: ${feelsLike}°C | Umidade: ${humidity}%</p>
            </div>
            
            <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin: 25px 0;">
              <p style="font-size: 16px; font-style: italic; color: #4b5563; line-height: 1.5; margin: 0;">
                "${motivacional}"
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            
            <p style="font-size: 12px; text-align: center; color: #9ca3af; margin: 0;">
              Você está recebendo este e-mail porque se inscreveu no Clima Certo.<br/>
              <br/>
              <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Cancelar inscrição</a>
            </p>
          </div>
        `;

        // d) Send email via Resend
        const emailRes = await resend.emails.send({
          from: "Clima Certo <previsao@seu-dominio.com>", // Replace with verified domain
          to: sub.email,
          subject: `Previsão e Inspiração para ${sub.city} ✨`,
          html: html,
        });

        results.push({ email: sub.email, status: "Success", resendId: emailRes.id });
      } catch (err: any) {
        console.error(`Error processing subscription for ${sub.email}:`, err);
        results.push({ email: sub.email, status: "Error", error: err.message });
      }
    }

    return new Response(JSON.stringify({ message: "Completed", results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Critical Error in Edge Function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
