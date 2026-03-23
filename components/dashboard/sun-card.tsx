"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sunset } from "lucide-react";

export function SunCard({ data }: { data: any }) {
  const [now, setNow] = useState(Date.now());

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
    <Card className="h-full relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 opacity-5">
        <Sunrise size={150} />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-indigo-100 flex items-center gap-2">
          Sol e Lua
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sunrise size={14} className="text-orange-400" /> Nascer
            </span>
            <span className="font-medium text-lg text-white">{sunrise}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
              Pôr <Sunset size={14} className="text-indigo-400" />
            </span>
            <span className="font-medium text-lg text-white">{sunset}</span>
          </div>
        </div>
        
        <div className="mt-4 relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-600 rounded-full transition-all duration-1000"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">{remainingText}</p>
      </CardContent>
    </Card>
  );
}
