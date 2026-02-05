<?php

namespace App\Console\Commands;

use App\Models\Subscriber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use PhpParser\Node\Stmt\Return_;

class SendWeatherAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-weather-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'It searches for the weather and sends alerts to subscribers.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $apiKey = env('OPENWEATHER_API_KEY');
        $subscribers = Subscriber :: all();

        foreach($subscribers as $subscriber){
            $this->info("Processing: {$subscriber->city}");

            // Chamada direta para a API 2.5 usando o nome da cidade (q)
            $response = Http::get("https://api.openweathermap.org/data/2.5/weather", [
                'q' => $subscriber->city,
                'appid' => $apiKey,
                'units' => 'metric',
                'lang' => 'pt_br'
            ]);

            if($response->successful()){
                $data = $response -> json();
                $temp = $data['main']['temp'];
                $description = $data['weather'][0]['description'];

                $this->info("Sucesso: {$temp}°C em {$subscriber->city}.");

                // Gerar o texto com a IA
                $mensagem = $this->generateTextWithLLM($subscriber->city, $temp, $description);

                $this->info("Mensagem da IA: " . $mensagem);

                // TODO: Aqui entrará o envio do e-mail no próximo passo
            }else{
                $this->error("Não consegui encontrar o clima para {$subscriber->city}. Verifique a chave ou o nome da cidade.");
            }
        }
    }

    private function generateTextWithLLM($city,$temp,$description){

        $prompt =   "Aja como um assistente de clima amigável. A cidade é {$city}. " .
                    "A temperatura é de {$temp}°C e o céu está com {$description}. " .
                    "Escreva uma mensagem curta (máximo 3 frases) para um e-mail matinal, " .
                    "dando uma dica de vestimenta ou atividade baseada no clima. Não use emojis.";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY'), [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ]
        ]);

        return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? "Bom dia! Hoje em {$city} faz {$temp}°C.";
    }
}
