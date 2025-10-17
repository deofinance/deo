// Base service class for all services
import { Pool, PoolClient, QueryResult } from 'pg';
import { getDatabasePool } from '@/lib/database/connection';

export class BaseService {
  protected pool: Pool;

  constructor() {
    this.pool = getDatabasePool();
  }

  /**
   * Execute a parameterized query
   */
  protected async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(text, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query and return single row
   */
  protected async queryOne<T = any>(
    text: string,
    params?: any[]
  ): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Execute query within a transaction
   */
  protected async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Build WHERE clause from filters
   */
  protected buildWhereClause(
    filters: Record<string, any>,
    startIndex: number = 1
  ): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = startIndex;

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  /**
   * Generate UUID (PostgreSQL function)
   */
  protected async generateUuid(): Promise<string> {
    const result = await this.queryOne<{ uuid: string }>(
      'SELECT gen_random_uuid() AS uuid'
    );
    return result?.uuid || '';
  }
}
