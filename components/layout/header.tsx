"use client"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setError("Por favor, insira o nome de uma cidade.")
      return
    }
    if (query.trim().length < 3) {
      setError("O nome da cidade deve ter pelo menos 3 caracteres.")
      return
    }
    setError("")
    // TODO: integrate with params or navigation for real search
    console.log("Searching for:", query)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <MapPin size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Clima Certo</span>
        </div>

        <form onSubmit={handleSearch} className="relative flex w-full max-w-sm items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar cidade..."
              className="pl-9 bg-white/5 border-white/10 focus-visible:ring-indigo-500/50 rounded-full"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (error) setError("")
              }}
            />
          </div>
          <Button type="submit" className="rounded-full px-5">Buscar</Button>
          {error && (
            <span className="absolute -bottom-6 left-0 text-xs text-red-400">
              {error}
            </span>
          )}
        </form>
      </div>
    </header>
  )
}
