# Configuração de Variáveis de Ambiente e Chaves (Secrets)

Este guia explica como configurar as chaves de API necessárias para a integração do provedor de e-mail (Resend) e da IA motivacional (Gemini).

## 1. Configurando Chaves no Supabase Edge Functions

Como as Edge Functions rodam em um ambiente seguro na nuvem, você não pode expor as chaves no código-fonte. Você precisará setar essas chaves como "Secrets" no Supabase.

### Chaves Necessárias
*   **`RESEND_API_KEY`**: Você pode obtê-la no painel do Resend ([resend.com/api-keys](https://resend.com/api-keys)).
*   **`GEMINI_API_KEY`**: Você pode criá-la no painel do Google AI Studio ([aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)).

### Passos de Desenvolvimento Local (Para testar `supabase functions serve`)
1. Na raiz do seu projeto `clima-certo`, crie um arquivo chamado `.env.local` (este arquivo já deve estar no `.gitignore`).
2. Adicione as chaves no formato padrão:
   ```env
   RESEND_API_KEY=re_suachave...
   GEMINI_API_KEY=AIzaSy_suachave...
   ```
3. Ao rodar sua função localmente para testes, diga ao Supabase CLI para injetar esse arquivo:
   ```bash
   npx supabase functions serve --env-file .env.local
   ```

### Passos de Produção (Enviando para o Supabase e Deploy)
Para que a Edge Function tenha acesso às chaves do lado do servidor na produção, você precisará configurar os secrets utilizando o terminal do Supabase CLI (você deve estar autenticado e ter vinculado seu projeto local):

```bash
# Configurar chave do Resend
npx supabase secrets set RESEND_API_KEY=re_suachave_aqui

# Configurar chave do Gemini
npx supabase secrets set GEMINI_API_KEY=AIzaSy_suachave_aqui
```

Para confirmar se as chaves foram adicionadas de forma segura e com sucesso, você pode listar as chaves injetadas (ele só mostrará o nome, os valores continuarão escondidos):
```bash
npx supabase secrets list
```
Após injetar os secrets, você pode fazer o deploy de sua função:
```bash
npx supabase functions deploy send-daily-weather
```

---

## 2. Configurando Chaves no Antigravity Secrets Manager

Uma boa prática ao criar ambientes com agentes autônomos como o Antigravity é configurar suas chaves diretamente no **Secrets Manager**. Assim, sempre que você solicitar ao agente uma automação, build, deploy, ou execução de scripts que usem o CLI de provedores, ele saberá de onde retirar essas variáveis.

1. Abra o **Secrets Manager** local do seu Antigravity (frequentemente acessível pelas preferências ou por uma ferramenta de injeção de ambiente que a CLI / Interface fornece).
2. Adicione os metadados de segredos (Key/Value) correspondentes:
   *   **Key**: `RESEND_API_KEY` | **Value**: `<Sua chave do Resend>`
   *   **Key**: `GEMINI_API_KEY` | **Value**: `<Sua chave do Gemini>`

Ao configurar essas chaves, o Antigravity será capaz de injetá-las em futuros scripts automatizados se você solicitar que ele rode uma tarefa que exija autenticação com essas APIs sem necessidade de intervenção manual da sua parte.
