import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Navigation } from "lucide-react";

export function WindCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-indigo-100 flex items-center gap-2">
          Vento
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-slate-700/50">
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-[spin_10s_linear_infinite]" />
          <div className="absolute flex flex-col items-center">
            <Navigation className="text-indigo-400 rotate-45 mb-1" size={20} />
            <span className="text-xs text-slate-400 font-medium">NE</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Wind size={12} className="text-indigo-400" /> Velocidade
            </span>
            <span className="font-semibold text-xl text-white">18 <span className="text-sm font-normal text-slate-400">km/h</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">Rajadas</span>
            <span className="font-medium text-slate-200">24 km/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
