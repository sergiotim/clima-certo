"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <Card className="border-indigo-500/50 bg-indigo-950/30">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center py-10">
          <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Inscrição Concluída!</h3>
          <p className="text-sm text-indigo-200">
            Você receberá atualizações diárias sobre {city} no email {email}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
          <Input 
            type="text" 
            placeholder="Sua Cidade (Ex: São Paulo)" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="bg-black/40 border-white/10"
          />
          <Input 
            type="email" 
            placeholder="seu@email.com.br" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-black/40 border-white/10"
          />
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Inscrevendo..." : "Inscrever-se"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
