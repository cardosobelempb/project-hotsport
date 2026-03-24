import pg from 'pg';

// Database connection pool for direct queries (legacy MySQL queries are handled separately)
// Prisma client will be added after prisma:generate is run
export const pool = new pg.Pool({
  connectionString: process.env['DATABASE_URL'],
});
