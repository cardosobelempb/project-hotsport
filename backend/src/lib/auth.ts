import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'default-secret-change-in-production',
  baseURL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:4949',
});
