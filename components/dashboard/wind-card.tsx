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
      <CardContent className="flex items-center gap-5 md:gap-8">
        <div className="relative flex items-center justify-center w-24 h-24 shrink-0 rounded-full border-2 border-white/5 bg-white/5">
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500/50 animate-[spin_12s_linear_infinite]" />
          <div className="absolute flex flex-col items-center">
            <Navigation className="text-indigo-400 mb-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" size={24} style={{ transform: `rotate(${data.wind.deg}deg)` }} />
            <span className="text-[10px] text-slate-400 font-black tracking-tighter">{data.wind.deg}°</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
              <Wind size={12} className="text-indigo-400" /> Velocidade
            </span>
            <span className="font-black text-2xl text-white tracking-tighter">{speed} <span className="text-sm font-normal text-slate-500">km/h</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Rajadas</span>
            <span className="font-bold text-slate-300 tracking-tighter">{gust} <span className="text-[10px] font-normal text-slate-500">km/h</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
