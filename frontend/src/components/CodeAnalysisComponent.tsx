import { useState } from 'react';

const MASTRA_URL = import.meta.env.VITE_MASTRA_URL || '';

export function CodeAnalysisComponent() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    if (!MASTRA_URL) {
      setError('Mastra Agent URL not configured (VITE_MASTRA_URL)');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(`${MASTRA_URL}/api/agents/codeAgent/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Please analyze this code:\n\n\`\`\`\n${code}\n\`\`\`` }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      setResult(data.text || data.content || JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-analysis-container">
      <h2>Code Analysis Agent</h2>
      <p className="subtitle">Paste your code and get AI-powered review and suggestions</p>

      <textarea
        className="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        rows={12}
        disabled={loading}
      />

      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={loading || !code.trim()}
      >
        {loading ? 'Analyzing...' : 'Analyze Code'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="analysis-result">
          <h3>Analysis Result</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
