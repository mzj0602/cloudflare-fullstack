import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createMastra } from './mastra';

interface Env {
  DEEPSEEK_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

const t = initTRPC.context<{ env: Env }>().create();

export const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { message: `Hello, ${input.name}! Welcome to Cloudflare Workers.` };
    }),

  fetchUrl: t.procedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      const content = await fetchUrlContent(input.url);
      return { content, url: input.url };
    }),

  chat: t.procedure
    .input(z.object({
      message: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.env.DEEPSEEK_API_KEY) {
        throw new Error('DEEPSEEK_API_KEY not configured');
      }
      const mastra = createMastra(ctx.env.DEEPSEEK_API_KEY);
      const agent = mastra.getAgent('chatAgent');
      const result = await agent.generate(input.message);
      return {
        reply: result.text,
        provider: 'deepseek',
        model: 'deepseek-chat',
      };
    }),

  ec2Health: t.procedure
    .query(async () => {
      try {
        const response = await fetch('https://ec2.yourdomain.online/health');
        const data = await response.json();
        return { status: 'connected', data };
      } catch (error) {
        return { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }),
});

async function fetchUrlContent(url: string): Promise<string> {
  // Security: only allow http/https
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are allowed');
  }

  // Block private/local IPs (SSRF prevention)
  const h = parsed.hostname;
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h.startsWith('10.') ||
    h.startsWith('192.168.') ||
    h.match(/^172\.(1[6-9]|2\d|3[01])\./)
  ) {
    throw new Error('Private/local URLs are not allowed');
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  return text;
}


export type AppRouter = typeof appRouter;
