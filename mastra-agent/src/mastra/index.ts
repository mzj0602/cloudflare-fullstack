import { Mastra } from '@mastra/core/mastra';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { codeAgent } from './agents/code-agent';

export const mastra = new Mastra({
  agents: { codeAgent },
  // No storage configured - code analysis agent doesn't need memory
  // This avoids pulling in the heavy @libsql/client dependency
  deployer: new CloudflareDeployer({
    scope: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    name: 'mastra-code-agent',
  }),
});
