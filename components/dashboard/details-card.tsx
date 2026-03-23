import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Gauge, Eye, Sun, Snowflake } from "lucide-react";

export function DetailsCard() {
  const details = [
    { label: "Umidade", value: "78%", icon: Droplet },
    { label: "Pressão", value: "1012 hPa", icon: Gauge },
    { label: "Visibilidade", value: "8 km", icon: Eye },
    { label: "Índice UV", value: "4 (Moderado)", icon: Sun },
    { label: "Ponto de Orvalho", value: "18°", icon: Snowflake },
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
