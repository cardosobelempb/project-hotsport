import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { prisma } from './db.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'hotspot-secret-key',
  baseURL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:4949',
});
