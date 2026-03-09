import { useState } from 'react';
import { ChatComponent } from './components/ChatComponent';
import { CodeAnalysisComponent } from './components/CodeAnalysisComponent';
import './App.css';

function App() {
  const [tab, setTab] = useState<'chat' | 'code'>('chat');

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
          className={`tab-btn ${tab === 'code' ? 'active' : ''}`}
          onClick={() => setTab('code')}
        >
          Code Analysis
        </button>
      </div>

      <main>
        {tab === 'chat' ? <ChatComponent /> : <CodeAnalysisComponent />}
      </main>

      <footer>
        <p>Powered by Cloudflare Pages & Workers</p>
      </footer>
    </div>
  );
}

export default App;
