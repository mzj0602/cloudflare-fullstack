import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function ChatComponent() {
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; url?: string }>>([]);

  const chatMutation = trpc.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message, url: url || undefined },
        { role: 'assistant', content: data.reply },
      ]);
      setMessage('');
      setUrl('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    chatMutation.mutate({ message });
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}</strong>
            {msg.url && (
              <p className="url-tag">URL: <a href={msg.url} target="_blank" rel="noreferrer">{msg.url}</a></p>
            )}
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL (optional)..."
          disabled={chatMutation.isPending}
          className="url-input"
        />
        <div className="message-row">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            disabled={chatMutation.isPending}
          />
          <button type="submit" disabled={chatMutation.isPending}>
            {chatMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>

      {chatMutation.isError && (
        <div className="error">Error: {chatMutation.error.message}</div>
      )}
    </div>
  );
}
