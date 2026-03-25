import { Card, CardContent } from "@/components/ui/card";
import { WeatherIcon } from "@/components/weather-icon";
import { WeatherData } from "@/lib/weather";

export function TemperatureCard({ data }: { data: WeatherData | null }) {
  if (!data) return <Card className="overflow-hidden relative border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-black/60"><CardContent className="p-6">Cidade não encontrada</CardContent></Card>;
  
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const tempMax = Math.round(data.main.temp_max);
  const tempMin = Math.round(data.main.temp_min);
  const desc = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const city = `${data.name}, ${data.sys.country}`;
  
  const dateStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card className="overflow-hidden relative border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-black/60">
      <div className="absolute top-0 right-0 p-8 opacity-20 text-indigo-300">
        <WeatherIcon code={iconCode} size={120} className="animate-pulse" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-medium text-indigo-100">{city}</h2>
            <p className="text-sm text-indigo-300/70 capitalize">{dateStr}</p>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-bold tracking-tighter text-white">{temp}°</span>
              <span className="text-2xl text-indigo-200">C</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <WeatherIcon code={iconCode} className="text-indigo-400" size={20} />
              <span className="text-lg font-medium text-indigo-100 capitalize">{desc}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="text-indigo-300/70">Sensação Térmica</span>
              <span className="font-semibold text-white text-base">{feelsLike}°</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-indigo-300/70">Máx / Mín</span>
              <span className="font-semibold text-white text-base">{tempMax}° / {tempMin}°</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
