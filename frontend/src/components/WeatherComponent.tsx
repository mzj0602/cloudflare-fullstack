import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function WeatherComponent() {
  const [city, setCity] = useState('');

  const weatherMutation = trpc.weather.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    weatherMutation.mutate({ city: city.trim() });
  };

  const raw = weatherMutation.data?.raw;

  return (
    <div className="weather-container">
      <h2>Weather Assistant</h2>
      <p className="subtitle">Enter a city name to get a real-time AI weather report</p>

      <form onSubmit={handleSubmit} className="weather-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Tokyo, London, Shanghai..."
          disabled={weatherMutation.isPending}
        />
        <button type="submit" disabled={weatherMutation.isPending || !city.trim()}>
          {weatherMutation.isPending ? 'Fetching...' : 'Get Weather'}
        </button>
      </form>

      {weatherMutation.isError && (
        <div className="error">Error: {weatherMutation.error.message}</div>
      )}

      {raw && (
        <div className="weather-card">
          <div className="weather-location">
            {raw.city}, {raw.country}
            <span className="weather-time">{raw.localTime}</span>
          </div>
          <div className="weather-stats">
            <div className="stat">
              <span className="stat-value">{raw.temperature}°C</span>
              <span className="stat-label">Temperature</span>
            </div>
            <div className="stat">
              <span className="stat-value">{raw.feelsLike}°C</span>
              <span className="stat-label">Feels like</span>
            </div>
            <div className="stat">
              <span className="stat-value">{raw.humidity}%</span>
              <span className="stat-label">Humidity</span>
            </div>
            <div className="stat">
              <span className="stat-value">{raw.windSpeed} km/h</span>
              <span className="stat-label">Wind</span>
            </div>
          </div>
          <div className="weather-condition">{raw.condition}</div>
        </div>
      )}

      {weatherMutation.data?.reply && (
        <div className="weather-ai">
          <h3>AI Report</h3>
          <p>{weatherMutation.data.reply}</p>
        </div>
      )}
    </div>
  );
}
