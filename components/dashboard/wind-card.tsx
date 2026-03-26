import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Navigation } from "lucide-react";
import { WeatherData } from "@/lib/weather";

export function WindCard({ data }: { data: WeatherData | null }) {
  if (!data) return null;
  const speed = Math.round(data.wind.speed * 3.6);
  const gust = data.wind.gust ? Math.round(data.wind.gust * 3.6) : "--";
  
  return (
    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl group hover:border-indigo-500/30 transition-all duration-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-indigo-100 flex items-center gap-2">
          Vento
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col justify-center py-6">
        <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16">
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0 rounded-full border-2 border-white/5 bg-white/5 shadow-inner">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500/50 animate-[spin_12s_linear_infinite]" />
            <div className="absolute flex flex-col items-center">
              <Navigation className="text-indigo-400 mb-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" size={28} style={{ transform: `rotate(${data.wind.deg}deg)` }} />
              <span className="text-xs text-slate-400 font-black tracking-tighter">{data.wind.deg}°</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                <Wind size={14} className="text-indigo-400" /> Velocidade
              </span>
              <span className="font-black text-3xl md:text-4xl text-white tracking-tighter transition-all hover:scale-105 origin-left">
                {speed} <span className="text-sm md:text-base font-normal text-slate-500 uppercase">km/h</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rajadas Intensas</span>
              <span className="font-bold text-xl text-slate-300 tracking-tighter">
                {gust} <span className="text-xs font-normal text-slate-500">km/h</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
