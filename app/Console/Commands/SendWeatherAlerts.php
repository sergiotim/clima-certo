<?php

namespace App\Console\Commands;

use App\Mail\WeatherAlert;
use App\Models\Subscriber;
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
            $response = Http::get("https://api.openweathermap.org/data/2.5/weather", [
                'q' => $subscriber->city,
                'appid' => $apiKey,
                'units' => 'metric',
                'lang' => 'pt_br'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $temp = $data['main']['temp'];
                $description = $data['weather'][0]['description'];

                $this->info("Sucesso: {$temp}°C em {$subscriber->city}.");

                // Gerar o texto com a IA (Gemini)
                $notice = $this->generateTextWithLLM($subscriber->city, $temp, $description);
                $this->info("Mensagem da IA: " . $notice);

                // Envio do e-mail
                Mail::to($subscriber->email)->send(new WeatherAlert($notice));

                $this->info("E-mail enviado para: " . $subscriber->email);
            } else {
                $this->error("Erro ao buscar clima para {$subscriber->city}. Verifique a chave da API.");
            }
        }
    }

    private function generateTextWithLLM($city, $temp, $description)
    {
        $prompt = "Aja como um assistente de clima amigável. A cidade é {$city}. " .
                  "A temperatura é de {$temp}°C e o céu está com {$description}. " .
                  "Escreva uma mensagem curta (máximo 3 frases) para um e-mail matinal, " .
                  "dando uma dica de vestimenta ou atividade baseada no clima. Não use emojis.";

        $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY'), [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ]
        ]);

        // Retorna o texto da IA ou uma mensagem padrão caso falhe
        return $response->json()['candidates'][0]['content']['parts'][0]['text'] 
               ?? "Bom dia! Hoje em {$city} faz {$temp}°C com {$description}.";
    }
}