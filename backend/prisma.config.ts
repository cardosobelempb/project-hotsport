import path from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaConfig } from 'prisma';

export default {
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter(env: Record<string, string | undefined>) {
      return new PrismaPg({ connectionString: env['DATABASE_URL'] ?? '' });
    },
  },
} satisfies PrismaConfig;
