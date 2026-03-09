import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../worker/src/trpc';

export const trpc = createTRPCReact<AppRouter>();
