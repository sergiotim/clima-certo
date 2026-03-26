import { TemperatureCard } from "@/components/dashboard/temperature-card";
import { DetailsCard } from "@/components/dashboard/details-card";
import { WindCard } from "@/components/dashboard/wind-card";
import { SunCard } from "@/components/dashboard/sun-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Header } from "@/components/layout/header";
import { WeatherIcon } from "@/components/weather-icon";
import { LocationDetector } from "@/components/location-detector";
import { Suspense } from "react";

import { getWeatherData, getDailyForecast } from "@/lib/weather";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  
  const city = typeof searchParams.city === "string" ? searchParams.city : undefined;
  const lat = typeof searchParams.lat === "string" ? parseFloat(searchParams.lat) : undefined;
  const lon = typeof searchParams.lon === "string" ? parseFloat(searchParams.lon) : undefined;

  let query: string | { lat: number; lon: number } = "São Paulo";
  
  if (city) {
    query = city;
  } else if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
    query = { lat, lon };
  }

  const weatherData = await getWeatherData(query);
  const forecastData = await getDailyForecast(query);

  const currentTime = new Date().getTime();
  const lastUpdated = weatherData?.dt
    ? `Dados atualizados há ${Math.max(1, Math.round((currentTime / 1000 - weatherData.dt) / 60))} min`
    : "Dados atualizados";

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-indigo-500/30">
      <Suspense fallback={null}>
        <LocationDetector />
      </Suspense>
      <Header />
      
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 relative z-10 flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Main Grid Section */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-gradient">Visão Geral</h1>
            <div className="text-xs md:text-sm text-indigo-200 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 backdrop-blur-sm">
              {lastUpdated}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 md:gap-6">
            <div className="lg:col-span-8">
              <TemperatureCard data={weatherData} />
            </div>
            <div className="lg:col-span-4">
              <SunCard data={weatherData} />
            </div>
            
            <div className="lg:col-span-6">
              <DetailsCard data={weatherData} />
            </div>
            <div className="lg:col-span-6">
              <WindCard data={weatherData} />
            </div>
          </div>
        </div>

        {/* Sidebar / Lateral Card */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <NewsletterSignup />
          
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="font-semibold text-white mb-1 text-sm relative z-10">Previsão 5 Dias</h3>
            <p className="text-xs text-slate-400 mb-5 relative z-10">Acompanhe a tendência semanal.</p>
            <div className="space-y-4 relative z-10">
              {forecastData ? forecastData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm group/item">
                  <span className="text-indigo-200 w-10 font-medium">{item.dayName}</span>
                  <WeatherIcon code={item.icon} size={24} className="text-white drop-shadow-sm transition-transform group-hover/item:scale-110" />
                  <span className="text-slate-300 font-semibold tabular-nums tracking-tighter">
                    {item.tempMax}°<span className="text-slate-500 mx-1">/</span>{item.tempMin}°
                  </span>
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
