import { TRPCError, initTRPC } from '@trpc/server';
import { z } from 'zod';

interface Env {
  DEEPSEEK_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

const t = initTRPC.context<{ env: Env }>().create();

export const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { message: `Hello, ${input.name}! Welcome to Cloudflare Workers.` };
    }),

  fetchUrl: t.procedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      const content = await fetchUrlContent(input.url);
      return { content, url: input.url };
    }),

  weather: t.procedure
    .input(z.object({ city: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let weatherData: Awaited<ReturnType<typeof fetchWeather>>;
      try {
        weatherData = await fetchWeather(input.city);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch weather';
        const isUserInputError =
          message.includes('City is required') ||
          message.includes('not found');
        throw new TRPCError({
          code: isUserInputError ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
          message,
        });
      }

      const prompt = `You are a friendly weather assistant. Based on the following real-time weather data, give a natural, helpful weather report in the same language the user used.

City: ${weatherData.city}, ${weatherData.country}
Temperature: ${weatherData.temperature}°C
Feels like: ${weatherData.feelsLike}°C
Humidity: ${weatherData.humidity}%
Wind speed: ${weatherData.windSpeed} km/h
Condition: ${weatherData.condition}
Time: ${weatherData.localTime}

Provide a brief, friendly weather summary and any relevant advice (clothing, activities, etc.).`;

      // If AI provider is unavailable/misconfigured, still return usable weather data.
      const result = await callDeepSeek(prompt, ctx.env).catch(() => ({
        reply: buildFallbackWeatherReply(weatherData, input.city),
        provider: 'fallback',
        model: 'template',
      }));
      return { ...result, raw: weatherData };
    }),

  chat: t.procedure
    .input(z.object({
      message: z.string(),
      provider: z.enum(['deepseek', 'openai', 'gemini']).optional().default('deepseek'),
      url: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { message, provider, url } = input;

      let finalMessage = message;
      if (url) {
        const content = await fetchUrlContent(url);
        finalMessage = `URL: ${url}\n\nPage content:\n${content}\n\n---\nUser question: ${message}`;
      }

      try {
        if (provider === 'deepseek') {
          return await callDeepSeek(finalMessage, ctx.env);
        } else if (provider === 'openai') {
          return await callOpenAI(finalMessage, ctx.env);
        } else {
          return await callGemini(finalMessage, ctx.env);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(msg);
      }
    }),

  ec2Health: t.procedure
    .query(async () => {
      try {
        const response = await fetch('https://ec2.yourdomain.online/health');
        const data = await response.json();
        return { status: 'connected', data };
      } catch (error) {
        return { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }),
});

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm',
};

async function fetchWeather(city: string) {
  const query = city.trim();
  if (!query) {
    throw new Error('City is required');
  }

  // Step 1: Geocode city name to coordinates with language fallbacks.
  // Keeping language flexible makes non-English city names (e.g. 北京) resolvable.
  const geoVariants = [undefined, 'zh', 'en'] as const;
  let location: any | null = null;

  for (const language of geoVariants) {
    const params = new URLSearchParams({
      name: query,
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

  if (!location) {
    throw new Error(`City "${city}" not found. Try an English name or include country, e.g. "Beijing, China".`);
  }

  const { latitude, longitude, name, country, timezone } = location;

  // Step 2: Fetch weather data
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&timezone=${encodeURIComponent(timezone)}`
  );
  if (!weatherRes.ok) throw new Error(`Weather fetch failed (${weatherRes.status})`);
  const weatherData = await weatherRes.json() as any;
  const c = weatherData.current;

  return {
    city: name,
    country,
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    condition: WEATHER_CODES[c.weather_code] ?? 'Unknown',
    localTime: c.time,
  };
}

function buildFallbackWeatherReply(
  weather: Awaited<ReturnType<typeof fetchWeather>>,
  userInput: string
) {
  const prefersChinese = /[\u4e00-\u9fff]/.test(userInput);
  if (prefersChinese) {
    return `${weather.city}当前${weather.condition}，气温${weather.temperature}°C，体感${weather.feelsLike}°C，湿度${weather.humidity}%，风速${weather.windSpeed} km/h。建议根据体感温度安排穿着并留意天气变化。`;
  }

  return `${weather.city} is currently ${weather.condition.toLowerCase()} with ${weather.temperature}°C (feels like ${weather.feelsLike}°C), humidity ${weather.humidity}% and wind ${weather.windSpeed} km/h. Dress for the felt temperature and keep an eye on updates.`;
}

async function fetchUrlContent(url: string): Promise<string> {
  // Security: only allow http/https
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are allowed');
  }

  // Block private/local IPs (SSRF prevention)
  const h = parsed.hostname;
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h.startsWith('10.') ||
    h.startsWith('192.168.') ||
    h.match(/^172\.(1[6-9]|2\d|3[01])\./)
  ) {
    throw new Error('Private/local URLs are not allowed');
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  return text;
}

async function callGemini(message: string, env: Env) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    reply: data.choices[0].message.content,
    provider: 'gemini',
    model: 'gemini-2.0-flash',
  };
}

async function callDeepSeek(message: string, env: Env) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    reply: data.choices[0].message.content,
    provider: 'deepseek',
    model: 'deepseek-chat',
  };
}

async function callOpenAI(message: string, env: Env) {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    reply: data.choices[0].message.content,
    provider: 'openai',
    model: 'gpt-3.5-turbo',
  };
}

export type AppRouter = typeof appRouter;
