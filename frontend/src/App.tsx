import { useState } from 'react';
import { ChatComponent } from './components/ChatComponent';
import { WeatherComponent } from './components/WeatherComponent';
import './App.css';

function App() {
  const [tab, setTab] = useState<'chat' | 'weather'>('chat');

  return (
    <div className="App">
      <header>
        <h1>Cloudflare Full Stack App</h1>
        <p>React + Vite + tRPC + Workers + AI</p>
      </header>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === 'chat' ? 'active' : ''}`}
          onClick={() => setTab('chat')}
        >
          AI Chat
        </button>
        <button
          className={`tab-btn ${tab === 'weather' ? 'active' : ''}`}
          onClick={() => setTab('weather')}
        >
          Weather
        </button>
      </div>

      <main>
        {tab === 'chat' ? <ChatComponent /> : <WeatherComponent />}
      </main>

      <footer>
        <p>Powered by Cloudflare Pages & Workers</p>
      </footer>
    </div>
  );
}

export default App;
