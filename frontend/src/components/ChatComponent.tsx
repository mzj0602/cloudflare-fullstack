import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function ChatComponent() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

  const chatMutation = trpc.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.reply }
      ]);
      setMessage('');
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
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
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
      </form>

      {chatMutation.isError && (
        <div className="error">Error: {chatMutation.error.message}</div>
      )}
    </div>
  );
}
