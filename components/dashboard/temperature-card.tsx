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
    <Card className="overflow-hidden relative border-white/10 bg-white/5 backdrop-blur-xl group hover:border-indigo-500/30 transition-all duration-500 rounded-2xl">
      <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 md:opacity-20 text-indigo-400 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <WeatherIcon code={iconCode} size={140} className="animate-pulse" />
      </div>
      <CardContent className="p-5 md:p-8 relative z-10">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-medium text-indigo-100">{city}</h2>
            <p className="text-sm text-indigo-300/70 capitalize">{dateStr}</p>
          </div>
          
          <div className="mt-4 md:mt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-md">{temp}°</span>
              <span className="text-xl md:text-3xl font-light text-indigo-300/80">C</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <WeatherIcon code={iconCode} className="text-indigo-400" size={20} />
              <span className="text-lg font-medium text-indigo-100 capitalize">{desc}</span>
            </div>
          </div>
          
          <div className="mt-6 md:mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-indigo-300/60 uppercase text-[10px] font-bold tracking-wider">Sensação</span>
              <span className="font-bold text-white text-lg">{feelsLike}°</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-indigo-300/60 uppercase text-[10px] font-bold tracking-wider">Máx / Mín</span>
              <span className="font-bold text-white text-lg">{tempMax}° / {tempMin}°</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
