import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const analyzeCodeTool = createTool({
  id: 'analyze-code',
  description: 'Analyze the structure of code: detect language, count lines, estimate complexity, and check for comments',
  inputSchema: z.object({
    code: z.string().describe('The source code to analyze'),
  }),
  outputSchema: z.object({
    language: z.string(),
    lineCount: z.number(),
    hasComments: z.boolean(),
    complexity: z.enum(['low', 'medium', 'high']),
    functions: z.number(),
  }),
  execute: async ({ context }) => {
    const { code } = context;
    const lines = code.split('\n').filter(l => l.trim().length > 0);

    // Detect language
    let language = 'Unknown';
    if (/import\s+React|\.tsx?$|:\s*(string|number|boolean|void)\b/.test(code)) {
      language = 'TypeScript / React';
    } else if (/def\s+\w+\(|import\s+numpy|print\(/.test(code)) {
      language = 'Python';
    } else if (/public\s+class|System\.out\.println/.test(code)) {
      language = 'Java';
    } else if (/func\s+\w+\(|:=\s/.test(code)) {
      language = 'Go';
    } else if (/const\s|let\s|function\s/.test(code)) {
      language = 'JavaScript / TypeScript';
    }

    // Count functions/methods
    const functions = (code.match(/\b(function\s+\w+|def\s+\w+|=>\s*\{|async\s+\w+\s*\()/g) || []).length;

    // Complexity based on control flow keywords
    const controlFlow = (code.match(/\b(if|for|while|switch|catch|&&|\|\|)\b/g) || []).length;
    const complexity = controlFlow < 4 ? 'low' : controlFlow < 10 ? 'medium' : 'high';

    const hasComments = /\/\/|\/\*|#\s/.test(code);

    return { language, lineCount: lines.length, hasComments, complexity, functions };
  },
});
