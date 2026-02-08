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
            // Não precisamos mais de latitude e longitude aqui
            $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
                'q' => $subscriber->city,
                'appid' => $apiKey,
                'units' => 'metric',
                'lang' => 'pt_br',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $this->info("Dados recebidos para {$subscriber->city}. Gerando texto com IA...");

                // Gerar o texto com a IA (Gemini)
                $notice = $this->generateTextWithLLM($subscriber->city, $data);
                $this->info('Mensagem da IA: '.$notice);

                // Envio do e-mail
                Mail::to($subscriber->email)->send(new WeatherAlert($notice));

                $this->info('E-mail enviado para: '.$subscriber->email);
            } else {
                $this->error("Erro ao buscar clima para {$subscriber->city}. Verifique a chave da API.");
            }
        }
    }

    private function generateTextWithLLM($city, $weatherData)
    {
        $jsonDetails = json_encode($weatherData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        
        $prompt = "Aja como um assistente de clima pessoal e muito amigável para a cidade de {$city}. " .
                  "Abaixo estão os dados técnicos brutos do clima atual: \n\n" .
                  $jsonDetails . "\n\n" .
                  "Com base nesses dados (especialmente temperatura, sensação térmica, umidade e vento), " .
                  "escreva uma mensagem de e-mail matinal curta e humana. " .
                  "No texto, você deve: \n" .
                  "1. Comentar sobre o clima atual e a sensação térmica real.\n" .
                  "2. Dar uma dica prática do que a pessoa deve vestir ou levar (ex: guarda-chuva, óculos de sol).\n" .
                  "3. Dar um conselho de saúde ou atividade para o dia em {$city}.\n" .
                  "Seja acolhedor.";


        // $response = Http::post('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key='.env('GEMINI_API_KEY'), [
        //     'contents' => [
        //         [   'parts' => [
        //                 ['text' => $prompt]
        //             ]
        //         ],
        //     ],
        // ]);
        $response = Gemini::generativeModel(model:'gemini-2.5-flash-lite')->generateContent($prompt);

        
        $data = $response->text();
        $this->info($data);

        // Retorna o texto da IA ou uma mensagem padrão caso falhe
        return $data ?? "Bom dia! Em {$city} faz " . ($weatherData['main']['temp'] ?? '--') . "°C.";
    }
}
