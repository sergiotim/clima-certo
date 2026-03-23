'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      return;
    }

    // TODO: Adicionar chamada real para o seu backend ou Supabase.
    // Exemplo: fetch('/api/unsubscribe', { method: 'DELETE', body: JSON.stringify({ email }) })
    // Aqui usamos um timer para mockar o loading state
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);

    return () => clearTimeout(timer);
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center max-w-md w-full text-center hover:shadow-md transition-shadow duration-300">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-zinc-100 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl font-bold text-zinc-800 mb-2 tracking-tight">Processando...</h1>
            <p className="text-zinc-500">Removendo seu e-mail da nossa lista.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-800 mb-3 tracking-tight">Inscrição Cancelada</h1>
            <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
              O e-mail <strong className="text-zinc-800 font-semibold">{email}</strong> foi removido com sucesso. Você não receberá mais os e-mails motivacionais diários.
            </p>
            <a 
              href="/" 
              className="mt-8 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl transition-all duration-200 w-full hover:-translate-y-0.5"
            >
              Voltar para o Início
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
               <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-800 mb-3 tracking-tight">Link Inválido</h1>
            <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
              Houve um problema ao processar seu cancelamento. Certifique-se de acessar o link completo enviado no e-mail.
            </p>
            <a 
              href="/" 
              className="mt-8 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-xl transition-all duration-200 w-full hover:-translate-y-0.5"
            >
              Ir para o Início
            </a>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-zinc-200 border-t-emerald-500 rounded-full animate-spin"></div></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
