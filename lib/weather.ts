export interface WeatherData {
  coord: { lat: number; lon: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  sys: { country: string; sunrise: number; sunset: number };
  name: string;
  dt: number;
  uvi?: number;
  dew_point?: number;
}

export async function getWeatherData(city: string): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENWEATHER_API_KEY");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&lang=pt_br&appid=${apiKey}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      if (res.status === 404) return null; // City not found
      throw new Error(`OpenWeather API error: ${res.status}`);
    }

    const data = (await res.json()) as WeatherData;

    // Calcular Ponto de Orvalho via fórmula de Magnus
    try {
      const temp = data.main.temp;
      const humidity = data.main.humidity;
      const a = 17.27;
      const b = 237.7;
      const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
      data.dew_point = Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
    } catch (err) {
      console.warn("Could not calculate dew point", err);
    }

    // Buscar Índice UV usando a API gratuita do OpenWeatherMap (2.5)
    try {
      const uvRes = await fetch(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`,
        { next: { revalidate: 300 } }
      );
      if (uvRes.ok) {
        const uvData = await uvRes.json();
        data.uvi = uvData.value;
      }
    } catch (err) {
      console.warn("Could not fetch UV index", err);
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  icon: string;
  description: string;
}

interface OpenWeatherForecastItem {
  dt: number;
  main: { temp: number };
  weather: Array<{ icon: string; description: string }>;
  dt_txt: string;
}

export async function getDailyForecast(city: string): Promise<DailyForecast[] | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&units=metric&lang=pt_br&appid=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const data = await res.json() as { list: OpenWeatherForecastItem[] };

    const dailyData = new Map<string, {
      date: string;
      temps: number[];
      icons: string[];
      descriptions: string[];
    }>();

    // Group forecast data by date string (YYYY-MM-DD)
    for (const item of data.list) {
      const dateStr = item.dt_txt.split(' ')[0];

      if (!dailyData.has(dateStr)) {
        dailyData.set(dateStr, {
          date: dateStr,
          temps: [],
          icons: [],
          descriptions: []
        });
      }

      const day = dailyData.get(dateStr)!;
      day.temps.push(item.main.temp);
      day.icons.push(item.weather[0].icon);
      day.descriptions.push(item.weather[0].description);
    }

    const forecast: DailyForecast[] = [];
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    let count = 0;
    for (const [dateStr, day] of dailyData.entries()) {
      if (count >= 5) break;

      const dateObj = new Date(dateStr + 'T12:00:00Z');

      const tempMax = Math.round(Math.max(...day.temps));
      const tempMin = Math.round(Math.min(...day.temps));

      const midPoint = Math.floor(day.icons.length / 2);
      const icon = day.icons[midPoint] || day.icons[0];
      const desc = day.descriptions[midPoint] || day.descriptions[0];

      forecast.push({
        date: dateStr,
        dayName: days[dateObj.getDay()],
        tempMax,
        tempMin,
        icon,
        description: desc
      });
      count++;
    }

    return forecast;
  } catch (error) {
    console.error("Failed to fetch forecast data:", error);
    return null;
  }
}
