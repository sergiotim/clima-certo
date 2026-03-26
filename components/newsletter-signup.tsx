"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";

import { useIBGEData } from "@/hooks/use-ibge-data";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("BR");
  
  const {
    states,
    cities,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    isLoadingCities: isLoadingCity
  } = useIBGEData(country);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Handled by hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !email) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          city: selectedCity,
          country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao realizar inscrição.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setSuccess(true);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="border-indigo-500/50 bg-indigo-950/30">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center py-10">
          <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Inscrição Concluída!</h3>
          <p className="text-sm text-indigo-200">
            Você receberá atualizações diárias sobre {selectedCity} no email {email}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-100">
          <Mail size={18} className="text-indigo-400" />
          Receber Clima Diário
        </CardTitle>
        <CardDescription>
          Receba o tempo exato para sua cidade todas as manhãs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          <div className="flex gap-2">
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setSelectedState("");
                setSelectedCity("");
              }}
              aria-label="Selecionar País"
              className="w-1/3 h-10 px-3 py-2 bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-md appearance-none text-sm outline-none transition-all hover:bg-black/60"
              required
            >
              <option value="BR" className="bg-slate-900 text-white">Brasil</option>
              <option value="OTHER" className="bg-slate-900 text-white">Outros</option>
            </select>

            {country === "BR" ? (
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                }}
                aria-label="Selecionar Estado"
                className="w-2/3 h-10 px-3 py-2 bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-md appearance-none text-sm outline-none transition-all hover:bg-black/60"
                required
              >
                <option value="" disabled className="text-slate-500 bg-slate-900">UF / Estado</option>
                {states.map((uf) => (
                  <option key={uf.id} value={uf.sigla} className="bg-slate-900 text-white">
                    {uf.sigla} - {uf.nome}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          {country === "BR" ? (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState || isLoadingCity}
              aria-label="Selecionar Cidade"
              className="w-full h-10 px-3 py-2 bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500/50 rounded-md appearance-none text-sm outline-none disabled:opacity-50 transition-all hover:bg-black/60"
              required
            >
              <option value="" disabled className="text-slate-500 bg-slate-900">
                {isLoadingCity ? "Carregando..." : "Sua Cidade"}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome} className="bg-slate-900 text-white">
                  {city.nome}
                </option>
              ))}
            </select>
          ) : (
            <Input 
              type="text" 
              placeholder="Digite a cidade e país (ex: Roma, IT)" 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Digite a cidade e país"
              required
              className="bg-black/40 border-white/10 focus:ring-indigo-500/50"
            />
          )}

          <Input 
            type="email" 
            placeholder="seu@email.com.br" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email para inscrição"
            required
            className="bg-black/40 border-white/10 focus:ring-indigo-500/50"
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting || !selectedCity}>
            {isSubmitting ? "Inscrevendo..." : "Inscrever-se"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
