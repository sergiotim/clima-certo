import React from "react";
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Snowflake,
  Haze,
  CloudRainWind,
} from "lucide-react";

export function WeatherIcon({
  code,
  size = 24,
  className = "",
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  const iconMap: Record<string, React.ElementType> = {
    "01d": Sun,
    "01n": Moon,
    "02d": CloudSun,
    "02n": CloudMoon,
    "03d": Cloud,
    "03n": Cloud,
    "04d": Cloud,
    "04n": Cloud,
    "09d": CloudDrizzle,
    "09n": CloudDrizzle,
    "10d": CloudRain,
    "10n": CloudRain,
    "11d": CloudLightning,
    "11n": CloudLightning,
    "13d": Snowflake,
    "13n": Snowflake,
    "50d": Haze,
    "50n": Haze,
  };

  const IconComponent = iconMap[code] || CloudRainWind;

  return <IconComponent size={size} className={className} />;
}
