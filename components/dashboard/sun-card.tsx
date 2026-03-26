"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sunset } from "lucide-react";
import { WeatherData } from "@/lib/weather";

export function SunCard({ data }: { data: WeatherData | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const sunriseMs = data.sys.sunrise * 1000;
  const sunsetMs = data.sys.sunset * 1000;

  const sunrise = new Date(sunriseMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(sunsetMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Calcular progresso do dia (entre nascer e pôr do sol)
  const totalDaylight = sunsetMs - sunriseMs;
  const elapsed = now - sunriseMs;
  const progress = Math.max(0, Math.min(1, elapsed / totalDaylight));

  // Calcular quanto falta para o pôr do sol
  const remaining = sunsetMs - now;
  let remainingText = "";

  if (remaining <= 0) {
    remainingText = "O sol já se pôs";
  } else if (now < sunriseMs) {
    const untilSunrise = sunriseMs - now;
    const h = Math.floor(untilSunrise / 3_600_000);
    const m = Math.floor((untilSunrise % 3_600_000) / 60_000);
    remainingText = `Faltam ${h}h e ${m}m para o nascer do sol`;
  } else {
    const h = Math.floor(remaining / 3_600_000);
    const m = Math.floor((remaining % 3_600_000) / 60_000);
    remainingText = `Faltam ${h}h e ${m}m para o pôr do sol`;
  }

  return (
    <Card className="h-full relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl group hover:border-indigo-500/30 transition-all duration-500">
      <div className="absolute -bottom-10 -right-10 opacity-5 text-indigo-400 group-hover:scale-110 transition-transform duration-700">
        <Sunrise size={180} />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-indigo-100 flex items-center gap-2 text-base md:text-lg">
          Sol e Lua
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5 border-r border-white/5 pr-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sunrise size={14} className="text-orange-400" /> Nascer
            </span>
            <span className="font-bold text-xl text-white">{sunrise}</span>
          </div>
          <div className="flex flex-col gap-1.5 pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sunset size={14} className="text-indigo-400" /> Pôr
            </span>
            <span className="font-bold text-xl text-white">{sunset}</span>
          </div>
        </div>
        
        <div className="mt-4 relative w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 via-amber-300 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="text-xs font-medium text-slate-400 mt-4 text-center bg-white/5 py-2 rounded-lg border border-white/5">{remainingText}</p>
      </CardContent>
    </Card>
  );
}
