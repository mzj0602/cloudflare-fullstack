import { useState } from 'react';
import { ChatComponent } from './components/ChatComponent';
import './App.css';

function App() {
  const [tab, setTab] = useState<'chat'>('chat');

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
      </div>

      <main>
        <ChatComponent />
      </main>

      <footer>
        <p>Powered by Cloudflare Pages & Workers</p>
      </footer>
    </div>
  );
}

export default App;
