import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createDeepSeek } from '@ai-sdk/deepseek';

export function createMastra(apiKey: string) {
  const deepseek = createDeepSeek({ apiKey });

  const chatAgent = new Agent({
    name: 'chat-agent',
    instructions: '你是一个智能助手，请用简洁清晰的语言回答用户的问题。',
    model: deepseek('deepseek-chat'),
  });

  return new Mastra({ agents: { chatAgent } });
}
