"use client";

import { CloudRainWind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TemperatureCard() {
  return (
    <Card className="overflow-hidden relative border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-black/60">
      <div className="absolute top-0 right-0 p-8 opacity-20 text-indigo-300">
        <CloudRainWind size={120} className="animate-pulse" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-medium text-indigo-100">São Paulo, BR</h2>
            <p className="text-sm text-indigo-300/70">Hoje, 23 de Março</p>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-bold tracking-tighter text-white">24°</span>
              <span className="text-2xl text-indigo-200">C</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CloudRainWind className="text-indigo-400" size={20} />
              <span className="text-lg font-medium text-indigo-100">Chuva Moderada</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <span className="text-indigo-300/70">Sensação Térmica</span>
              <span className="font-semibold text-white text-base">26°</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-indigo-300/70">Máx / Mín</span>
              <span className="font-semibold text-white text-base">28° / 19°</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
