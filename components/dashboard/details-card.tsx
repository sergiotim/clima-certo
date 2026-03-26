import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Gauge, Eye, Sun, Snowflake } from "lucide-react";
import { WeatherData } from "@/lib/weather";

export function DetailsCard({ data }: { data: WeatherData | null }) {
  if (!data) return null;
  const details = [
    { label: "Umidade", value: `${data.main.humidity}%`, icon: Droplet },
    { label: "Pressão", value: `${data.main.pressure} hPa`, icon: Gauge },
    { label: "Visibilidade", value: `${(data.visibility / 1000).toFixed(1)} km`, icon: Eye },
    { label: "Índice UV", value: data.uvi !== undefined ? data.uvi : "N/A", icon: Sun },
    { label: "Ponto de Orvalho", value: data.dew_point !== undefined ? `${Math.round(data.dew_point)}°C` : "N/A", icon: Snowflake },
  ];

  return (
    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl group hover:border-indigo-500/30 transition-all duration-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-indigo-100 flex items-center gap-2">
          Detalhes Técnicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
          {details.map((detail, index) => (
            <div key={index} className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5 group/item hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <detail.icon size={14} className="text-indigo-400 group-hover/item:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{detail.label}</span>
              </div>
              <span className="font-bold text-slate-100">{detail.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
