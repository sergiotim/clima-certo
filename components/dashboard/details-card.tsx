import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Gauge, Eye, Sun, Snowflake } from "lucide-react";

export function DetailsCard({ data }: { data: any }) {
  if (!data) return null;
  const details = [
    { label: "Umidade", value: `${data.main.humidity}%`, icon: Droplet },
    { label: "Pressão", value: `${data.main.pressure} hPa`, icon: Gauge },
    { label: "Visibilidade", value: `${(data.visibility / 1000).toFixed(1)} km`, icon: Eye },
    { label: "Índice UV", value: "N/A", icon: Sun },
    { label: "Ponto de Orvalho", value: "N/A", icon: Snowflake },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-indigo-100 flex items-center gap-2">
          Detalhes Técnicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {details.map((detail, index) => (
            <div key={index} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <detail.icon size={14} className="text-indigo-400" />
                <span className="text-xs text-slate-400">{detail.label}</span>
              </div>
              <span className="font-medium text-slate-200">{detail.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
