<?php

namespace App\Console\Commands;

use App\Mail\WeatherAlert;
use App\Models\Subscriber;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class SendWeatherAlerts extends Command
{
    protected $signature = 'app:send-weather-alerts';

    protected $description = 'Busca o clima e envia alertas aos inscritos.';

    public function handle()
    {
        $apiKey = env('OPENWEATHER_API_KEY');
        $subscribers = Subscriber::all();

        

        foreach ($subscribers as $subscriber) {
            $this->info("Processando: {$subscriber->city}");

            // Chamada direta para a API 2.5 usando o nome da cidade (q)
            $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
                'q' => $subscriber->city,
                'appid' => $apiKey,
                'units' => 'metric',
                'lang' => 'pt_br',
            ]);

            if ($response->successful()) {
                $weatherData = $response->json();

                $offset = $weatherData['timezone'];

                $dataLocaleCity = now()->addSecond($offset)->locale('pt_BR');

                $formatedData = $dataLocaleCity->translatedFormat('l, d \d\e F \d\e Y');

                
                $this->info("Dados recebidos para {$subscriber->city}. Gerando texto com IA...");

                // Gerar o texto com a IA (Gemini)
                $notice = $this->generateTextWithLLM($subscriber->city, $weatherData, $formatedData);
                $this->info('Mensagem da IA: '.$notice);

                // Envio do e-mail
                Mail::to($subscriber->email)->send(new WeatherAlert($notice));

                $this->info('E-mail enviado para: '.$subscriber->email);
            } else {
                $this->error("Erro ao buscar clima para {$subscriber->city}. Verifique a chave da API.");
            }
        }
    }

    private function generateTextWithLLM($city, $weatherData,$date)
    {
        $jsonDetails = json_encode($weatherData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        
        $prompt = "
        ### PERSONA
        Aja como um assistente de clima pessoal e local, extremamente amigável, humano e atencioso.

        ### CONTEXTO
        - Cidade: {$city}
        - Data e Dia da Semana: {$date}
        - Dados Técnicos (JSON): {$jsonDetails}

        ### TAREFA
        Escreva um e-mail matinal personalizado para um morador de {$city} baseando-se nos dados acima.

        ### REGRAS DE CONTEÚDO
        1. SAUDAÇÃO: Comece com uma saudação calorosa mencionando o dia da semana (ex: 'Feliz terça-feira' ou 'Bom sábado').
        2. TOM DE VOZ: Use o dia da semana para definir o tom. Se for dia útil, foque em motivação e produtividade. Se for fim de semana, foque em descanso, lazer e atividades ao ar livre.
        3. ANÁLISE TÉCNICA HUMANA: Não apenas repita os números. Explique a sensação térmica e a umidade de forma prática (ex: 'apesar dos 28 graus, a sensação é de mais calor devido à umidade').
        4. RECOMENDAÇÕES: Dê uma dica específica de vestimenta e uma dica de saúde ou lazer em {$city}.

        ### RESTRIÇÕES CRÍTICAS (NÃO QUEBRAR)
        - NÃO inclua a linha de 'Assunto:' no corpo do texto.
        - NÃO use emojis.
        - NÃO use formatação matemática ou científica (proibido usar $, {}, ^, LaTeX ou Markdown complexo). Escreva apenas '28 graus' ou '28°C'.
        ";



        $response = Gemini::generativeModel(model:'gemini-2.5-flash-lite')->generateContent($prompt);

        
        $data = $response->text();
        $this->info($data);

        // Retorna o texto da IA ou uma mensagem padrão caso falhe
        return $data ?? "Bom dia! Em {$city} faz " . ($weatherData['main']['temp'] ?? '--') . "°C.";
    }
}
