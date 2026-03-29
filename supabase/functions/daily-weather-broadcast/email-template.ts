interface WeatherEmailTemplateInput {
  message: string;
  unsubscribeLink: string;
  city: string;
  weatherData: Record<string, unknown>;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return null;
}

function formatTemp(value: unknown): string {
  const num = toNumber(value);
  if (num === null) return "--";
  return `${num.toFixed(1).replace(".", ",")}°C`;
}

function formatTimeFromUnix(unixSeconds: unknown, timezoneOffset: unknown): string {
  const unix = toNumber(unixSeconds);
  const tz = toNumber(timezoneOffset);
  if (unix === null || tz === null) return "--";

  const date = new Date((unix + tz) * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatPercent(value: unknown): string {
  const num = toNumber(value);
  if (num === null) return "--";
  return `${Math.round(num)}%`;
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}

function windLabel(speedMs: unknown): string {
  const speed = toNumber(speedMs);
  if (speed === null) return "sem dados";
  if (speed < 3) return "vento fraco";
  if (speed < 8) return "vento moderado";
  return "vento forte";
}

function comfortLabel(humidityValue: unknown): string {
  const humidity = toNumber(humidityValue);
  if (humidity === null) return "umidade indisponivel";
  if (humidity < 35) return "ar seco, vale reforcar a hidratacao";
  if (humidity > 75) return "ar mais umido, sensacao de abafamento";
  return "umidade confortavel";
}

function dayTip(params: {
  temp: unknown;
  weatherMain: unknown;
  weatherDescription: unknown;
  humidity: unknown;
  windSpeed: unknown;
}): string {
  const temp = toNumber(params.temp);
  const humidity = toNumber(params.humidity);
  const windSpeed = toNumber(params.windSpeed);
  const weatherMain = String(params.weatherMain ?? "").toLowerCase();
  const description = String(params.weatherDescription ?? "").toLowerCase();

  if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || description.includes("chuva")) {
    return "Leve guarda-chuva ou capa leve para evitar imprevistos no deslocamento.";
  }

  if (temp !== null && temp >= 32) {
    return "Hoje pede agua por perto e pausas curtas na sombra nos horarios mais quentes.";
  }

  if (temp !== null && temp <= 18) {
    return "Vale sair com uma camada extra de roupa no comeco e no fim do dia.";
  }

  if (humidity !== null && humidity < 35) {
    return "Ar seco hoje: mantenha hidratacao frequente e, se possivel, umidifique o ambiente.";
  }

  if (windSpeed !== null && windSpeed >= 8) {
    return "Com vento mais forte, prefira roupas confortaveis e evite itens muito leves.";
  }

  return "Clima favoravel para uma rotina equilibrada: planeje o dia e mantenha um bom ritmo.";
}

export function generateWeatherEmailHtml({
  message,
  unsubscribeLink,
  city,
  weatherData,
}: WeatherEmailTemplateInput): string {
  const main = toRecord(weatherData.main);
  const wind = toRecord(weatherData.wind);
  const sys = toRecord(weatherData.sys);
  const weatherArray = Array.isArray(weatherData.weather) ? weatherData.weather : [];
  const primaryWeather = toRecord(weatherArray[0]);

  const cityName = escapeHtml(weatherData.name || city);
  const country = sys.country ? `, ${escapeHtml(sys.country)}` : "";
  const cityLabel = `${cityName}${country}`;

  const nowTemp = formatTemp(main.temp);
  const feelsLike = formatTemp(main.feels_like);
  const tempMin = formatTemp(main.temp_min);
  const tempMax = formatTemp(main.temp_max);
  const weatherDescriptionRaw = String(primaryWeather.description || "condicao indisponivel");
  const weatherDescription = escapeHtml(capitalizeFirst(weatherDescriptionRaw));
  const humidity = formatPercent(main.humidity);
  const windSpeed = toNumber(wind.speed);
  const windText = windSpeed === null
    ? "--"
    : `${windSpeed.toFixed(1).replace(".", ",")} m/s`;

  const sunrise = formatTimeFromUnix(sys.sunrise, weatherData.timezone);
  const sunset = formatTimeFromUnix(sys.sunset, weatherData.timezone);
  const windLabelText = windLabel(wind.speed);
  const windLabelDisplay = escapeHtml(capitalizeFirst(windLabelText));

  const practicalTip = dayTip({
    temp: main.temp,
    weatherMain: primaryWeather.main,
    weatherDescription: primaryWeather.description,
    humidity: main.humidity,
    windSpeed: wind.speed,
  });

  const formattedMessage = message
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 10px; line-height: 1.6; color: #374151; font-size: 14px;">${escapeHtml(paragraph)}</p>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clima Certo - Seu resumo do dia</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f4f7fb;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #0f172a;
    }
    .container {
      max-width: 640px;
      margin: 24px auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
    }
    .hero {
      background: radial-gradient(circle at 10% 20%, #60a5fa 0%, #2563eb 45%, #0ea5a4 100%);
      padding: 28px 24px;
      color: #ffffff;
    }
    .hero h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.4px;
    }
    .hero p {
      margin: 8px 0 0;
      font-size: 15px;
      opacity: 0.95;
    }
    .content {
      padding: 20px;
    }
    .section-title {
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
    .card {
      margin-bottom: 10px;
      padding: 14px;
      background: linear-gradient(135deg, #f8fbff 0%, #f1f5f9 100%);
      border: 2px solid #dbeafe;
      border-radius: 14px;
      text-align: center;
    }
    .card-label {
      margin: 0 0 8px;
      color: #475569;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 700;
    }
    .card-value {
      margin: 0;
      color: #0f172a;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.1;
    }
    .card-sub {
      margin: 8px 0 0;
      color: #334155;
      font-size: 13px;
      line-height: 1.45;
    }
    .card-grid {
      display: table;
      width: 100%;
      border-spacing: 10px;
      margin: 0 0 12px -10px;
    }
    .card-grid-item {
      display: table-cell;
      width: 50%;
      padding: 12px 10px;
      background: linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%);
      border: 2px solid #bfdbfe;
      border-radius: 12px;
      vertical-align: top;
    }
    .card-grid-item .card-label {
      font-size: 12px;
      margin-bottom: 8px;
      color: #0c4a6e;
    }
    .card-grid-item .card-value {
      font-size: 28px;
      margin-bottom: 6px;
    }
    .card-grid-item .card-sub {
      font-size: 12px;
      margin-top: 6px;
    }
    .tip-box {
      margin: 12px 0 16px;
      padding: 14px 16px;
      border-radius: 14px;
      background: linear-gradient(130deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #86efac;
      color: #0f172a;
      font-size: 14px;
      line-height: 1.5;
    }
    .tip-box strong {
      color: #065f46;
      display: block;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .message-card {
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      background: #ffffff;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      line-height: 1.6;
    }
    .unsubscribe-btn {
      display: inline-block;
      margin-top: 8px;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid #fecaca;
      background: #fff1f2;
      color: #be123c;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      .hero h1 {
        font-size: 28px;
      }
      .card {
        padding: 12px;
      }
      .card-grid {
        display: block;
        margin-left: 0;
        border-spacing: 0;
      }
      .card-grid-item {
        display: block;
        width: auto;
        margin-bottom: 12px;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f4f7fb; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background:#f4f7fb;">
    <tr>
      <td align="center" style="padding:24px 8px;">
        <div class="container" style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 14px 34px rgba(15, 23, 42, 0.08);">
          <div class="hero" style="background:#2563eb; background-image:radial-gradient(circle at 10% 20%, #60a5fa 0%, #2563eb 45%, #0ea5a4 100%); padding:28px 24px; color:#ffffff;">
            <h1 style="margin:0; font-size:32px; font-weight:800; letter-spacing:-0.4px; color:#ffffff;">Seu clima de hoje</h1>
            <p style="margin:8px 0 0; font-size:15px; opacity:0.95; color:#ffffff;">${cityLabel}</p>
          </div>

          <div class="content" style="padding:20px;">
            <h2 class="section-title" style="margin:0 0 12px; font-size:18px; font-weight:700; color:#0f172a;">Temperatura Agora</h2>
            <div class="card" style="margin-bottom:10px; padding:14px; background:#f8fbff; border:2px solid #dbeafe; border-radius:14px; text-align:center;">
              <p class="card-label" style="margin:0 0 8px; color:#475569; font-size:13px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Temperatura</p>
              <p class="card-value" style="margin:0; color:#0f172a; font-size:34px; font-weight:800; letter-spacing:-1px; line-height:1.1;">${nowTemp}</p>
              <p class="card-sub" style="margin:8px 0 0; color:#334155; font-size:13px; line-height:1.45;">${weatherDescription}</p>
            </div>

            <div class="card-grid" role="presentation" style="display:table; width:100%; border-spacing:10px; margin:0 0 12px -10px;">
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#eff6ff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Mínima</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${tempMin}</p>
              </div>
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#ecfeff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Máxima</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${tempMax}</p>
              </div>
            </div>

            <h2 class="section-title" style="margin:0 0 12px; font-size:18px; font-weight:700; color:#0f172a;">Conforto Térmico</h2>
            <div class="card-grid" role="presentation" style="display:table; width:100%; border-spacing:10px; margin:0 0 12px -10px;">
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#eff6ff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Sensação Térmica</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${feelsLike}</p>
                <p class="card-sub" style="margin:6px 0 0; color:#334155; font-size:12px; line-height:1.45;">${escapeHtml(comfortLabel(main.humidity))}</p>
              </div>
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#ecfeff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Umidade do Ar</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${humidity}</p>
                <p class="card-sub" style="margin:6px 0 0; color:#334155; font-size:12px; line-height:1.45;">Teor de vapor na atmosfera</p>
              </div>
            </div>

            <h2 class="section-title" style="margin:0 0 12px; font-size:18px; font-weight:700; color:#0f172a;">Vento e Luz</h2>
            <div class="card-grid" role="presentation" style="display:table; width:100%; border-spacing:10px; margin:0 0 12px -10px;">
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#eff6ff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Condição do Vento</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${windLabelDisplay}</p>
                <p class="card-sub" style="margin:6px 0 0; color:#334155; font-size:12px; line-height:1.45;">Velocidade: ${windText}</p>
              </div>
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#ecfeff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Velocidade</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${windText}</p>
                <p class="card-sub" style="margin:6px 0 0; color:#334155; font-size:12px; line-height:1.45;">Escala local do vento</p>
              </div>
            </div>

            <div class="card-grid" role="presentation" style="display:table; width:100%; border-spacing:10px; margin:0 0 12px -10px;">
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#eff6ff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Nascer do Sol</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${sunrise}</p>
              </div>
              <div class="card-grid-item" style="display:table-cell; width:50%; padding:12px 10px; background:#ecfeff; border:2px solid #bfdbfe; border-radius:12px; vertical-align:top;">
                <p class="card-label" style="margin:0 0 8px; color:#0c4a6e; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; font-weight:700;">Pôr do Sol</p>
                <p class="card-value" style="margin:0; color:#0f172a; font-size:28px; font-weight:800; line-height:1.1;">${sunset}</p>
              </div>
            </div>

            <h2 class="section-title" style="margin:0 0 12px; font-size:18px; font-weight:700; color:#0f172a;">Dica Prática</h2>
            <div class="tip-box" style="margin:12px 0 16px; padding:14px 16px; border-radius:14px; background:#ecfdf5; border:2px solid #86efac; color:#0f172a; font-size:14px; line-height:1.5;">
              <strong style="color:#065f46; display:block; margin-bottom:10px; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">Recomendação do Dia</strong>
              ${escapeHtml(practicalTip)}
            </div>

            <h2 class="section-title" style="margin:0 0 12px; font-size:18px; font-weight:700; color:#0f172a;">Mensagem do Dia</h2>
            <div class="message-card" style="border:2px solid #e2e8f0; border-radius:14px; padding:14px; background:#ffffff;">
              ${formattedMessage}
            </div>
          </div>

          <div class="footer" style="border-top:1px solid #e5e7eb; background:#f8fafc; padding:20px; text-align:center; color:#64748b; font-size:12px; line-height:1.6;">
            <div>Você está recebendo este e-mail porque se inscreveu no Clima Certo.</div>
            <a href="${unsubscribeLink}" class="unsubscribe-btn" style="display:inline-block; margin-top:8px; padding:8px 16px; border-radius:999px; border:1px solid #fecaca; background:#fff1f2; color:#be123c; text-decoration:none; font-weight:600; font-size:12px;">Cancelar Inscrição</a>
            <div style="margin-top: 10px;">© ${new Date().getFullYear()} Clima Certo</div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
