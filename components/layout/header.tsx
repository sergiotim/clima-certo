import { MapPin } from "lucide-react"
import { CitySelector } from "@/components/city-selector"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto flex h-auto min-h-16 items-center justify-between px-4 py-3 sm:py-0 flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white">
            <MapPin size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Clima Certo</span>
        </div>

        <div className="w-full sm:w-auto">
          <CitySelector />
        </div>
      </div>
    </header>
  )
}
