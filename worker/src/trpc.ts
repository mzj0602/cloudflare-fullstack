import { initTRPC } from '@trpc/server';
import { z } from 'zod';

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

  chat: t.procedure
    .input(z.object({
      message: z.string(),
      provider: z.enum(['deepseek', 'openai', 'gemini']).optional().default('deepseek')
    }))
    .mutation(async ({ input, ctx }) => {
      const { message, provider } = input;

      try {
        if (provider === 'deepseek') {
          return await callDeepSeek(message, ctx.env);
        } else if (provider === 'openai') {
          return await callOpenAI(message, ctx.env);
        } else {
          return await callGemini(message, ctx.env);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(msg);
      }
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

async function callGemini(message: string, env: Env) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-2.0-flash',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    reply: data.choices[0].message.content,
    provider: 'gemini',
    model: 'gemini-2.0-flash',
  };
}

async function callDeepSeek(message: string, env: Env) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    reply: data.choices[0].message.content,
    provider: 'deepseek',
    model: 'deepseek-chat',
  };
}

async function callOpenAI(message: string, env: Env) {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json() as any;
  return {
    reply: data.choices[0].message.content,
    provider: 'openai',
    model: 'gpt-3.5-turbo',
  };
}

export type AppRouter = typeof appRouter;
