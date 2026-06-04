import type { WeatherDay } from "./types";

// Maps Open-Meteo WMO weather codes onto our 3-icon set.
function codeToIcon(code: number): WeatherDay["icon"] {
  if (code <= 1) return "sun";                 // clear / mainly clear
  if (code <= 48) return "cloudsun";           // partly cloudy / overcast / fog
  return "rain";                               // drizzle, rain, snow, showers, storms
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Fetches a real 7-day forecast for a farm's coordinates. Returns our domain
// WeatherDay[] so the UI stays unchanged. Free, no API key (Open-Meteo).
// Runs in the user's browser; callers fall back to simulated data on failure.
export async function fetchWeather(lat: number, lon: number): Promise<WeatherDay[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,precipitation_probability_max` +
    `&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const j = await res.json();
  const d = j?.daily;
  if (!d?.time?.length) throw new Error("Open-Meteo: empty payload");

  return (d.time as string[]).map((iso, i) => ({
    day: WD[new Date(`${iso}T00:00`).getDay()],
    icon: codeToIcon(Number(d.weather_code?.[i] ?? 0)),
    tempF: Math.round(Number(d.temperature_2m_max?.[i] ?? 0)),
    rainPct: Math.round(Number(d.precipitation_probability_max?.[i] ?? 0)),
  }));
}
