import { Mastra } from '@mastra/core/mastra';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { weatherAgent } from './agents/weather-agent';

export const mastra = new Mastra({
  agents: { weatherAgent },
  deployer: new CloudflareDeployer({
    scope: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    name: 'mastra-weather-agent',
  }),
});
