import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';
import { getWeatherByCityTool } from '../tools/weather-tool';

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Assistant Agent',
  instructions: `You are a weather assistant.

When users ask about weather, always call the get-weather-by-city tool first to get real-time data.

Then respond with:
1. Current condition
2. Temperature and feels-like
3. Humidity and wind
4. Practical advice (clothing/activities)

Rules:
- Reply in the same language as the user.
- Keep answers concise and practical.
- If city is ambiguous or not found, ask a clear follow-up question.`,
  model: deepseek('deepseek-chat'),
  tools: { getWeatherByCityTool },
});
