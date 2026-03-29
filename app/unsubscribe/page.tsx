"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "invalid">(
    !token || token.trim().length === 0 ? "invalid" : "loading"
  );

  useEffect(() => {
    if (status !== "loading" || !token) return;

    async function unsubscribe() {
      try {
        const response = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus("invalid");
          return;
        }

        setStatus("success");
      } catch {
        setStatus("invalid");
      }
    }

    unsubscribe();
  }, [token, status]);

  return (
    <Card className="max-w-md w-full border-white/10 bg-black/50 backdrop-blur-xl">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-75">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            <Loader2 size={64} className="text-indigo-400 animate-spin" />
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Processando Cancelamento</h2>
              <p className="text-slate-400 text-sm">Por favor, aguarde enquanto removemos seu e-mail da nossa lista.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Inscrição Cancelada</h2>
              <p className="text-slate-300 text-sm mb-6">
                Você não receberá mais os alertas diários do Clima Certo.
                Lamentamos ver você partir!
              </p>
              <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                ← Voltar para a Página Inicial
              </Link>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={48} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Token Inválido</h2>
              <p className="text-slate-300 text-sm mb-6">
                O link de cancelamento parece estar quebrado ou já foi utilizado.
              </p>
              <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                ← Voltar para a Página Inicial
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Clima Certo</h1>
          <p className="text-indigo-200/70">Gerenciamento de Assinatura</p>
        </div>
        
        <Suspense fallback={<div className="text-slate-400 text-center">Carregando...</div>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  );
}
