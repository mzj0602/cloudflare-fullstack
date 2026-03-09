import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';
import { analyzeCodeTool } from '../tools/code-tools';

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

export const codeAgent = new Agent({
  name: 'Code Analysis Agent',
  instructions: `You are an expert code reviewer with deep knowledge of software engineering best practices.

When given code to analyze:
1. First use the analyze-code tool to understand the code structure
2. Then provide a structured review with these sections:

**Overview** - What this code does in 1-2 sentences

**Issues Found** - Bugs, logic errors, or security concerns (if any)

**Improvements** - Specific suggestions to make the code better (performance, readability, maintainability)

**Best Practices** - Which conventions or patterns are missing or violated

**Refactored Snippet** - Show a small example of how a key part could be improved (if applicable)

Be direct and actionable. Focus on the most impactful suggestions.`,
  model: deepseek('deepseek-chat'),
  tools: { analyzeCodeTool },
});
