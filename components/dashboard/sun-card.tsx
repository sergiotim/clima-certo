import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sunset } from "lucide-react";

export function SunCard() {
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
            <span className="font-medium text-lg text-white">06:12</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
              Pôr <Sunset size={14} className="text-indigo-400" />
            </span>
            <span className="font-medium text-lg text-white">18:45</span>
          </div>
        </div>
        
        <div className="mt-4 relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Barra de Progresso Simbolizando a passagem do dia */}
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-600 rounded-full w-3/4" />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">Faltam 2h e 53m para o pôr do sol</p>
      </CardContent>
    </Card>
  );
}
