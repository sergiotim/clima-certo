"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIBGEData } from "@/hooks/use-ibge-data";

export function CitySelector() {
  const router = useRouter();
  const [country, setCountry] = useState("BR");
  
  const {
    states,
    cities,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    isLoadingCities: isLoading
  } = useIBGEData(country);

  // Handled by hook

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    
    const query = country === "BR" ? `${selectedCity}, ${selectedState}, BR` : selectedCity;
    router.push(`/?city=${encodeURIComponent(query)}`);
  };

  const displayedCities = country === "BR" && selectedState ? cities : [];

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row w-full max-w-2xl items-center gap-2">
      <div className="relative w-full flex gap-2">
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setSelectedState("");
            setSelectedCity("");
          }}
          aria-label="Selecionar País"
          className="w-1/3 h-11 px-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-xl appearance-none text-sm outline-none transition-all hover:bg-white/10"
          required
        >
          <option value="BR" className="bg-slate-900 text-white">Brasil</option>
          <option value="OTHER" className="bg-slate-900 text-white">Outros</option>
        </select>

        {country === "BR" ? (
          <>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
              }}
              aria-label="Selecionar Estado"
              className="w-1/4 h-11 px-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-xl appearance-none text-sm outline-none transition-all hover:bg-white/10"
              required
            >
              <option value="" disabled className="text-slate-500 bg-slate-900">UF</option>
              {states.map((uf) => (
                <option key={uf.id} value={uf.sigla} className="bg-slate-900 text-white">
                  {uf.sigla}
                </option>
              ))}
            </select>
            
            <div className="relative w-full">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState || isLoading}
                aria-label="Selecionar Cidade"
                className="w-full h-11 pl-10 pr-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-xl appearance-none text-sm outline-none disabled:opacity-50 transition-all hover:bg-white/10"
                required
              >
                <option value="" disabled className="text-slate-500 bg-slate-900">
                  {isLoading ? "Carregando..." : "Cidade"}
                </option>
                {displayedCities.map((city) => (
                  <option key={city.id} value={city.nome} className="bg-slate-900 text-white">
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Digite a cidade e país (ex: Paris, FR)"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Digite a cidade e país"
              className="w-full h-11 pl-10 pr-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-xl text-sm outline-none transition-all hover:bg-white/10"
              required
            />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full sm:w-auto rounded-xl px-6 h-11 whitespace-nowrap active:scale-95 transition-all shadow-lg shadow-indigo-500/20" disabled={!selectedCity}>
        Buscar
      </Button>
    </form>
  );
}
