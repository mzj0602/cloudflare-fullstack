import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
};

export const getWeatherByCityTool = createTool({
  id: 'get-weather-by-city',
  description: 'Get real-time weather by city name using Open-Meteo geocoding and forecast APIs.',
  inputSchema: z.object({
    city: z.string().describe('City name, such as Beijing, London, 上海, 北京'),
  }),
  outputSchema: z.object({
    city: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string(),
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    condition: z.string(),
    localTime: z.string(),
  }),
  execute: async ({ city }) => {
    const query = city.trim();
    if (!query) {
      throw new Error('City is required');
    }

    const queryCandidates = buildGeocodeQueryCandidates(query);
    const geoVariants = [undefined, 'zh', 'en'] as const;
    let location: any | null = null;

    for (const candidate of queryCandidates) {
      for (const language of geoVariants) {
        const params = new URLSearchParams({
          name: candidate,
          count: '1',
          format: 'json',
        });
        if (language) {
          params.set('language', language);
        }

        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
        if (!geoRes.ok) {
          continue;
        }

        const geoData = await geoRes.json() as any;
        if (geoData.results?.length) {
          location = geoData.results[0];
          break;
        }
      }
      if (location) {
        break;
      }
    }

    if (!location) {
      throw new Error(`City "${city}" not found`);
    }

    const { latitude, longitude, name, country, timezone } = location;
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&timezone=${encodeURIComponent(timezone)}`
    );

    if (!weatherRes.ok) {
      throw new Error(`Weather fetch failed (${weatherRes.status})`);
    }

    const weatherData = await weatherRes.json() as any;
    const current = weatherData.current;

    return {
      city: name,
      country,
      latitude,
      longitude,
      timezone,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      condition: WEATHER_CODES[current.weather_code] ?? 'Unknown',
      localTime: current.time,
    };
  },
});

function buildGeocodeQueryCandidates(query: string): string[] {
  const normalized = query
    .replace(/[，。]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  const stripped = normalized.replace(
    /(市|省|自治区|特别行政区|壮族自治区|回族自治区|维吾尔自治区)$/u,
    ''
  );

  const chineseCityAliases: Record<string, string> = {
    北京: 'Beijing',
    上海: 'Shanghai',
    广州: 'Guangzhou',
    深圳: 'Shenzhen',
    杭州: 'Hangzhou',
    南京: 'Nanjing',
    苏州: 'Suzhou',
    成都: 'Chengdu',
    重庆: 'Chongqing',
    武汉: 'Wuhan',
    西安: "Xi'an",
    天津: 'Tianjin',
    长沙: 'Changsha',
    郑州: 'Zhengzhou',
    青岛: 'Qingdao',
    宁波: 'Ningbo',
    厦门: 'Xiamen',
    昆明: 'Kunming',
    哈尔滨: 'Harbin',
    沈阳: 'Shenyang',
    大连: 'Dalian',
    济南: 'Jinan',
    福州: 'Fuzhou',
  };

  const set = new Set<string>([normalized]);
  if (stripped && stripped !== normalized) {
    set.add(stripped);
  }

  const alias = chineseCityAliases[normalized] ?? chineseCityAliases[stripped];
  if (alias) {
    set.add(alias);
    set.add(`${alias}, China`);
  }

  return Array.from(set);
}
