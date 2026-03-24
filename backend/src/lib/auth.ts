import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'dev-secret-change-in-production',
});
