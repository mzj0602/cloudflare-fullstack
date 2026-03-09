import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';

const queryClient = new QueryClient();

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${WORKER_URL}/trpc`,
    }),
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
