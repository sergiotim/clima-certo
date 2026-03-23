"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

export function CitySelector() {
  const router = useRouter();
  const [country, setCountry] = useState("BR");
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (country === "BR") {
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
        .then((res) => res.json())
        .then((data) => setStates(data))
        .catch((err) => console.error("Erro ao buscar estados:", err));
    }
  }, [country]);

  useEffect(() => {
    if (country === "BR") {
      if (!selectedState) {
        setCities([]);
        setSelectedCity("");
        return;
      }
      
      setIsLoading(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`)
        .then((res) => res.json())
        .then((data) => {
          setCities(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao buscar cidades:", err);
          setIsLoading(false);
        });
    }
  }, [selectedState, country]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    
    const query = country === "BR" ? `${selectedCity}, ${selectedState}, BR` : selectedCity;
    router.push(`/?city=${encodeURIComponent(query)}`);
  };

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
          className="w-1/3 h-10 px-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-lg appearance-none text-sm outline-none"
          required
        >
          <option value="BR" className="bg-slate-900 text-white">Brasil</option>
          <option value="OTHER" className="bg-slate-900 text-white">Outros</option>
        </select>

        {country === "BR" ? (
          <>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-1/4 h-10 px-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-lg appearance-none text-sm outline-none"
              required
            >
              <option value="" disabled className="text-slate-500 bg-slate-900">Estado</option>
              {states.map((uf) => (
                <option key={uf.id} value={uf.sigla} className="bg-slate-900 text-white">
                  {uf.sigla}
                </option>
              ))}
            </select>
            
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState || isLoading}
                className="w-full h-10 pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-lg appearance-none text-sm outline-none disabled:opacity-50"
                required
              >
                <option value="" disabled className="text-slate-500 bg-slate-900">
                  {isLoading ? "Carregando..." : "Cidade"}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nome} className="bg-slate-900 text-white">
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Digite a cidade e país (ex: Paris, FR)"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-10 pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-lg text-sm outline-none"
              required
            />
          </div>
        )}
      </div>
      <Button type="submit" className="w-full sm:w-auto rounded-lg px-5 h-10 whitespace-nowrap" disabled={!selectedCity}>
        Buscar
      </Button>
    </form>
  );
}
