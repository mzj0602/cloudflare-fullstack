import { ChatComponent } from './components/ChatComponent';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Cloudflare Full Stack App</h1>
        <p>React + Vite + tRPC + Workers + AI</p>
      </header>

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
