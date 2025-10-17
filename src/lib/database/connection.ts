// Database connection manager
import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Neon-optimized settings
      statement_timeout: 60000, // 60 seconds
      query_timeout: 60000,
    };

    // Add SSL configuration if DB_SSL_MODE is set (for Neon and production databases)
    if (process.env.DB_SSL_MODE === 'require' || process.env.NODE_ENV === 'production') {
      config.ssl = {
        rejectUnauthorized: true,
      };
    }

    pool = new Pool(config);

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });

    // Log successful connection in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Database pool initialized with max connections:', config.max);
    }
  }

  return pool;
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getDatabasePool();
    const result = await pool.query('SELECT 1 AS test');
    return result.rows[0].test === 1;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
