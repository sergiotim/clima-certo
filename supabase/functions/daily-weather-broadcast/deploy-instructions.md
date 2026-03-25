# Deploy e Configuração da Automação de E-mails

Este documento descreve as etapas para configurar a Supabase Edge Function `daily-weather-broadcast` no seu projeto que usa Groq e Brevo.

## 1. Secrets (Variáveis de Ambiente)
Antes de fazer o deploy, você precisa configurar os SECRETS da função no Supabase. Execute os seguintes comandos no terminal usando o CLI do Supabase:

\`\`\`bash
# Configuração de envio via Brevo
supabase secrets set BREVO_API_KEY="xkeysib-XXXXX"
supabase secrets set BREVO_SENDER_EMAIL="contato.climacerto@gmail.com"

# Inteligência Artificial com Groq
supabase secrets set GROQ_API_KEY="gsk_XXXXX"

# Dados de clima OpenWeatherMap (2.5 ou 3.0)
supabase secrets set OPENWEATHER_API_KEY="sua_chave_openweather"

# URL Base da sua aplicação para o link de Unsubscribe funcionar corretamente
supabase secrets set APP_URL="https://seu-app.vercel.app"
\`\`\`

## 2. Deploy da Edge Function
Após definir as variáveis de ambiente, envie o código para nuvem:

\`\`\`bash
supabase functions deploy daily-weather-broadcast --no-verify-jwt
\`\`\`

> A flag `--no-verify-jwt` é útil se você for chamar esta função externamente ou através do cron \`pg_net\`, mas certifique-se de adicionar uma validação de header caso queira restringir perfeitamente o acesso.

## 3. Agendamento Automático (CRON)
Use a extensão `pg_net` para disparar a função todos os dias de manhã. Vá no **SQL Editor** do painel do Supabase e rode:

\`\`\`sql
-- Crie a extensão caso não exista
create extension if not exists pg_net;

-- Crie o agendamento (Cron) para as 08:00 da manhã, horário de Brasília (11:00 UTC)
select cron.schedule(
    'enviar-mensagens-clima',
    '0 11 * * *', -- Executa às 11:00 AM UTC (08:00 AM BSB)
    $$
    select net.http_post(
        url := 'https://<seu-project-ref>.supabase.co/functions/v1/daily-weather-broadcast',
        headers := '{"Authorization": "Bearer SUA_CHAVE_ANON"}'::jsonb
    );
    $$
);
\`\`\`

Substitua \`<seu-project-ref>\` e \`SUA_CHAVE_ANON\` pelas credenciais do seu projeto. Caso deseje parar o cron, basta usar:
\`\`\`sql
select cron.unschedule('enviar-mensagens-clima');
\`\`\`
