"use client"

import { MapPin } from "lucide-react"
import { CitySelector } from "@/components/city-selector"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 flex-wrap gap-4 py-2 sm:py-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <MapPin size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Clima Certo</span>
        </div>

        <CitySelector />
      </div>
    </header>
  )
}
