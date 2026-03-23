import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Resend } from "npm:resend";
import { createClient } from "npm:@supabase/supabase-js";

// Inicializa Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Inicializa Gemini AI (Google Generative AI)
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

serve(async (req) => {
  try {
    // 1. Configurar variáveis Supabase para interagir com o Banco de Dados
    // const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // const supabase = createClient(supabaseUrl, supabaseServiceKey);
    //
    // const { data: users, error } = await supabase.from('subscribers').select('email, name').eq('is_subscribed', true);
    // if (error) throw error;
    
    // Lista mockada de emails para demonstração (substituir pela query do DB na produção)
    const users = [
      { email: "usuario@exemplo.com", name: "Usuário Mock" }
    ];

    // 2. Buscar Dados do Clima (Exemplo: SP - Open-Meteo sem necessidade de API KEY)
    // Para melhorar as previsões de múltiplos usuários, busque as coordenadas ou a cidade deles no banco.
    const lat = -23.5505;
    const lon = -46.6333;
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo`);
    if (!weatherResponse.ok) {
        throw new Error("Erro ao buscar a previsão do tempo");
    }
    const weatherData = await weatherResponse.json();

    // 3. Gerar Mensagem Motivacional com Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
      systemInstruction: "Você é um assistente motivacional brasileiro muito carismático. Você receberá um JSON com a previsão do tempo de hoje. Sua tarefa é analisar o clima (se está chovendo, ensolarado, frio, etc.) e retornar APENAS uma mensagem curta (máximo de 2 parágrafos), inspiradora e com bastante energia positiva, escrita em português do Brasil, para motivar a pessoa a ter um ótimo dia. Não inclua saudações genéricas no início, vá direto para a mensagem utilizando o contexto do clima."
    });

    const promptText = JSON.stringify(weatherData.current_weather || weatherData);
    const aiResult = await model.generateContent(promptText);
    const motivationalMessage = aiResult.response.text();

    if (!resend) {
        throw new Error("Resend API Key não está configurada");
    }

    // 4. Enviar E-mails Transacionais
    const emailsPromises = users.map(user => {
      // Cria link de cancelamento
      // Substituir 'https://seusite.com' pela variável de ambiente com sua URL de produção (ex: Deno.env.get('NEXT_PUBLIC_SITE_URL'))
      const unsubscribeLink = `https://seusite.com/unsubscribe?email=${encodeURIComponent(user.email)}`;

      return resend.emails.send({
        from: "Clima Certo <onboarding@resend.dev>",
        to: [user.email],
        subject: "🌤️ Sua Previsão e Inspiração Diária!",
        html: `
          <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
            <div style="background: linear-gradient(135deg, #0ba360 0%, #3cba92 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Bom dia!</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px 30px; border-left: 1px solid #eaeaea; border-right: 1px solid #eaeaea;">
                <p style="font-size: 16px; line-height: 1.6; color: #4a4a68;">
                  Aqui está a mensagem que preparamos para você usando Inteligência Artificial com base no clima de hoje:
                </p>
                <div style="border-left: 4px solid #3cba92; background: #f4fdfa; padding: 20px; font-style: italic; font-size: 17px; margin: 25px 0; color: #2d3748; border-radius: 0 8px 8px 0; line-height: 1.7;">
                  ${motivationalMessage.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div style="background-color: #f7f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eaeaea; border-top: none; text-align: center;">
              <p style="font-size: 13px; color: #718096; margin-bottom: 10px;">
                Você está recebendo este e-mail porque se inscreveu nos alertas de clima.+motivação.
              </p>
              <a href="${unsubscribeLink}" style="color: #3cba92; text-decoration: underline; font-weight: bold; font-size: 13px;">
                Cancelar inscrição
              </a>
            </div>
          </div>
        `,
      });
    });

    const results = await Promise.allSettled(emailsPromises);

    return new Response(JSON.stringify({ success: true, results, message: "Emails processados!" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || error }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
