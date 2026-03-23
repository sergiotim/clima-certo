export function generateWeatherEmailHtml(
    messageHtml: string,
    unsubscribeLink: string
  ): string {
    // Formata a mensagem gerada pelo gemini para ter quebras de linha em HTML
    const formattedMessage = messageHtml
      .split('\\n')
      .map((paragraph) => (paragraph.trim() ? \`<p style="line-height: 1.6; color: #374151;">\${paragraph}</p>\` : ''))
      .join('');
  
    return \`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clima Certo - Seu Dia Produtivo</title>
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f3f4f6;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .header {
        background: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%);
        padding: 30px 20px;
        text-align: center;
        color: white;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.025em;
      }
      .content {
        padding: 30px;
        color: #1f2937;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
      .unsubscribe-btn {
        display: inline-block;
        margin-top: 15px;
        font-size: 13px;
        color: #ef4444;
        text-decoration: none;
        padding: 8px 16px;
        border: 1px solid #fee2e2;
        background-color: #fef2f2;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .unsubscribe-btn:hover {
        background-color: #fee2e2;
        color: #dc2626;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>☀️ Bom dia com o Clima Certo</h1>
      </div>
      
      <div class="content">
        \${formattedMessage}
      </div>
  
      <div class="footer">
        <p>Você está recebendo este e-mail porque se inscreveu na newsletter do Clima Certo.</p>
        <p>
          <a href="\${unsubscribeLink}" class="unsubscribe-btn">
            Cancelar Inscrição
          </a>
        </p>
        <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
          © \${new Date().getFullYear()} Clima Certo. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </body>
  </html>
    \`;
  }
  
