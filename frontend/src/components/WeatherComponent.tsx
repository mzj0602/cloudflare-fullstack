import { useState } from 'react';

const MASTRA_URL = import.meta.env.VITE_MASTRA_URL || 'http://localhost:4111';

type WeatherState = {
  loading: boolean;
  error: string | null;
  reply: string | null;
};

export function WeatherComponent() {
  const [city, setCity] = useState('');
  const [weatherState, setWeatherState] = useState<WeatherState>({
    loading: false,
    error: null,
    reply: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    const input = city.trim();

    setWeatherState({ loading: true, error: null, reply: null });
    try {
      const response = await fetch(`${MASTRA_URL}/api/agents/weatherAgent/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `请查询 ${input} 的实时天气，并给出简洁建议。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed (${response.status})`);
      }

      const data = await response.json();
      const reply = extractMastraText(data);

      if (!reply) {
        throw new Error('Weather reply is empty');
      }

      setWeatherState({ loading: false, error: null, reply });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setWeatherState({ loading: false, error: message, reply: null });
    }
  };

  return (
    <div className="weather-container">
      <h2>Weather Assistant</h2>
      <p className="subtitle">Enter a city name to get a real-time weather report from Mastra Agent</p>

      <form onSubmit={handleSubmit} className="weather-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. 北京, Tokyo, London..."
          disabled={weatherState.loading}
        />
        <button type="submit" disabled={weatherState.loading || !city.trim()}>
          {weatherState.loading ? 'Fetching...' : 'Get Weather'}
        </button>
      </form>

      {weatherState.error && (
        <div className="error">Error: {weatherState.error}</div>
      )}

      {weatherState.reply && (
        <div className="weather-ai">
          <h3>AI Report</h3>
          <p>{weatherState.reply}</p>
        </div>
      )}
    </div>
  );
}

function extractMastraText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;

  const directText = pickText(data.text)
    ?? pickText(data.outputText)
    ?? pickText(data.content)
    ?? pickText(data.answer);
  if (directText) return directText;

  const steps = data.steps;
  if (Array.isArray(steps)) {
    for (const step of steps) {
      if (!step || typeof step !== 'object') continue;
      const text = pickText((step as Record<string, unknown>).text)
        ?? pickText((step as Record<string, unknown>).outputText);
      if (text) return text;
    }
  }

  return null;
}

function pickText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}
