// /.netlify/functions/get-solar-sim
//
// Simulates real-time solar production from a 15kW system at La Ripa
// using actual solar radiation + weather data from Open-Meteo (free, no key).
//
// Open-Meteo docs: https://open-meteo.com/en/docs
// Coordinates: La Ripa, San Gimignano (43.5023, 11.0717)

const LAT = 43.5023;
const LON = 11.0717;
const PEAK_KW = 15;       // installed peak power
const EFFICIENCY = 0.82;  // system efficiency (inverter + wiring losses ~18%)

// Weather code → { icon, it, en }
const WEATHER_ICONS = {
  0:  { icon: "☀️", it: "Sereno",               en: "Clear sky" },
  1:  { icon: "🌤️", it: "Prevalentemente sereno", en: "Mainly clear" },
  2:  { icon: "⛅", it: "Parzialmente nuvoloso",  en: "Partly cloudy" },
  3:  { icon: "☁️", it: "Coperto",               en: "Overcast" },
  45: { icon: "🌫️", it: "Nebbia",               en: "Fog" },
  48: { icon: "🌫️", it: "Nebbia gelata",         en: "Rime fog" },
  51: { icon: "🌦️", it: "Pioggerella leggera",   en: "Light drizzle" },
  53: { icon: "🌦️", it: "Pioggerella",           en: "Drizzle" },
  55: { icon: "🌧️", it: "Pioggerella intensa",   en: "Heavy drizzle" },
  61: { icon: "🌧️", it: "Pioggia leggera",       en: "Light rain" },
  63: { icon: "🌧️", it: "Pioggia",              en: "Rain" },
  65: { icon: "🌧️", it: "Pioggia intensa",       en: "Heavy rain" },
  71: { icon: "🌨️", it: "Neve leggera",          en: "Light snow" },
  73: { icon: "🌨️", it: "Neve",                 en: "Snow" },
  75: { icon: "❄️", it: "Neve intensa",          en: "Heavy snow" },
  80: { icon: "🌦️", it: "Rovesci leggeri",       en: "Light showers" },
  81: { icon: "🌧️", it: "Rovesci",              en: "Showers" },
  82: { icon: "⛈️", it: "Rovesci intensi",       en: "Heavy showers" },
  95: { icon: "⛈️", it: "Temporale",            en: "Thunderstorm" },
  96: { icon: "⛈️", it: "Temporale con grandine", en: "Thunderstorm with hail" },
  99: { icon: "⛈️", it: "Temporale con grandine intensa", en: "Heavy thunderstorm" },
};

function getWeatherInfo(code) {
  return WEATHER_ICONS[code] || { icon: "🌡️", it: "Variabile", en: "Variable" };
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "max-age=300", // cache 5 min
  };

  try {
    const url = [
      `https://api.open-meteo.com/v1/forecast`,
      `?latitude=${LAT}&longitude=${LON}`,
      `&current=weather_code,cloud_cover,direct_radiation,diffuse_radiation,is_day,temperature_2m`,
      `&daily=sunrise,sunset,sunshine_duration`,
      `&timezone=Europe%2FRome`,
      `&forecast_days=1`,
    ].join("");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

    const data = await res.json();
    const cur = data.current;
    const daily = data.daily;

    const isDay = cur.is_day === 1;
    const cloudCover = cur.cloud_cover ?? 0;          // 0–100 %
    const directRad = cur.direct_radiation ?? 0;      // W/m²
    const diffuseRad = cur.diffuse_radiation ?? 0;    // W/m²
    const weatherCode = cur.weather_code ?? 0;
    const temperature = cur.temperature_2m ?? 20;

    // Total irradiance on tilted panel (approximate)
    const totalIrradiance = directRad + diffuseRad * 0.5; // W/m²

    // Temperature correction: panels lose ~0.4%/°C above 25°C
    const tempFactor = 1 - Math.max(0, (temperature - 25) * 0.004);

    // Simulated output
    // STC = 1000 W/m² → at that irradiance a 15kW system produces 15kW (before efficiency)
    const powerKw = isDay
      ? Math.max(0, (totalIrradiance / 1000) * PEAK_KW * EFFICIENCY * tempFactor)
      : 0;

    // Estimate today's energy: sunshine_duration in seconds
    const sunshineSec = daily.sunshine_duration?.[0] ?? 0;
    const sunshineHours = sunshineSec / 3600;
    // Rough daily estimate based on cloud cover reduction
    const cloudFactor = 1 - (cloudCover / 100) * 0.75;
    const dayEnergyKwh = sunshineHours * PEAK_KW * EFFICIENCY * cloudFactor * 0.6; // 0.6 avg irradiance factor

    const weather = getWeatherInfo(weatherCode);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: true,
        powerKw: Math.round(powerKw * 10) / 10,
        dayEnergyKwh: Math.round(dayEnergyKwh * 10) / 10,
        peakKw: PEAK_KW,
        cloudCover,
        isDay,
        temperature: Math.round(temperature),
        weatherCode,
        weatherIcon: weather.icon,
        weatherIt: weather.it,
        weatherEn: weather.en,
        sunrise: daily.sunrise?.[0] ?? null,
        sunset: daily.sunset?.[0] ?? null,
        sunshineSec: daily.sunshine_duration?.[0] ?? null,
        timestamp: cur.time,
      }),
    };
  } catch (err) {
    console.error("get-solar-sim error:", err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ available: false, reason: err.message }),
    };
  }
};
