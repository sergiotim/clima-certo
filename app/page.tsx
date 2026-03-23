import { TemperatureCard } from "@/components/dashboard/temperature-card";
import { DetailsCard } from "@/components/dashboard/details-card";
import { WindCard } from "@/components/dashboard/wind-card";
import { SunCard } from "@/components/dashboard/sun-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Header } from "@/components/layout/header";
import { WeatherIcon } from "@/components/weather-icon";

import { getWeatherData, getDailyForecast } from "@/lib/weather";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const city = typeof searchParams.city === "string" ? searchParams.city : "São Paulo";
  const weatherData = await getWeatherData(city);
  const forecastData = await getDailyForecast(city);

  return (
    <div className="min-h-screen bg-[#070B14]">
      <Header />
      
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]" />
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* Main Grid Section */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
            <div className="text-sm text-indigo-200 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Dados atualizados há 2 min
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-full">
              <TemperatureCard data={weatherData} />
            </div>
            <div className="lg:col-span-4 h-full">
              <SunCard data={weatherData} />
            </div>
            
            <div className="lg:col-span-6 h-full">
              <DetailsCard data={weatherData} />
            </div>
            <div className="lg:col-span-6 h-full">
              <WindCard data={weatherData} />
            </div>
          </div>
        </div>

        {/* Sidebar / Lateral Card */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <NewsletterSignup />
          
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-xl border border-white/5 p-6 backdrop-blur-md">
            <h3 className="font-medium text-white mb-2 text-sm">Previsão 5 Dias</h3>
            <p className="text-xs text-slate-400 mb-4">Acompanhe a tendência semanal.</p>
            <div className="space-y-3">
              {forecastData ? forecastData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-indigo-200 w-8">{item.dayName}</span>
                  <span className="text-lg"><WeatherIcon code={item.icon} size={20} className="text-white" /></span>
                  <span className="text-slate-300 font-medium">{item.tempMax}°/{item.tempMin}°</span>
                </div>
              )) : (
                <div className="text-sm text-slate-400">Dados não disponíveis</div>
              )}
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
