import { Mastra } from '@mastra/core/mastra';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { codeAgent } from './agents/code-agent';

export const mastra = new Mastra({
  agents: { codeAgent },
  deployer: new CloudflareDeployer({
    scope: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    projectName: 'mastra-code-agent',
  }),
});
