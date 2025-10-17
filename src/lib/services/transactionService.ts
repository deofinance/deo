// Transaction service
import { BaseService } from './baseService';
import { Transaction, TransactionType, TransactionStatus, ChainId, StablecoinSymbol } from '@/types';

export class TransactionService extends BaseService {
  /**
   * Create a transaction record
   */
  async createTransaction(params: {
    user_id: string;
    transaction_type: TransactionType;
    amount: string;
    stablecoin: StablecoinSymbol;
    chain_id: ChainId;
    from_address?: string;
    to_address?: string;
    tx_hash?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (
        user_id,
        transaction_type,
        status,
        amount,
        stablecoin,
        chain_id,
        from_address,
        to_address,
        tx_hash,
        description,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const transaction = await this.queryOne<Transaction>(query, [
      params.user_id,
      params.transaction_type,
      'pending',
      params.amount,
      params.stablecoin,
      params.chain_id,
      params.from_address || null,
      params.to_address || null,
      params.tx_hash || null,
      params.description || null,
      JSON.stringify(params.metadata || {}),
    ]);

    if (!transaction) {
      throw new Error('Failed to create transaction');
    }

    return transaction;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    return this.queryOne<Transaction>(query, [id]);
  }

  /**
   * Get transactions by user
   */
  async getTransactionsByUser(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: TransactionType;
      status?: TransactionStatus;
    } = {}
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const { limit = 50, offset = 0, type, status } = options;

    const whereConditions = ['user_id = $1'];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      whereConditions.push(`transaction_type = $${paramIndex++}`);
      params.push(type);
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM transactions WHERE ${whereClause}`;
    const countResult = await this.queryOne<{ count: string }>(countQuery, params);
    const total = parseInt(countResult?.count || '0', 10);

    // Get transactions
    params.push(limit, offset);
    const query = `
      SELECT * FROM transactions
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const transactions = await this.query<Transaction>(query, params);

    return { transactions, total };
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    txHash?: string
  ): Promise<Transaction | null> {
    const query = `
      UPDATE transactions
      SET status = $1,
          tx_hash = COALESCE($2, tx_hash),
          confirmed_at = CASE WHEN $1 = 'completed' THEN now() ELSE confirmed_at END
      WHERE id = $3
      RETURNING *
    `;

    return this.queryOne<Transaction>(query, [status, txHash || null, id]);
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(txHash: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE tx_hash = $1';
    return this.queryOne<Transaction>(query, [txHash]);
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    const query = `
      SELECT * FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    return this.query<Transaction>(query, [userId, limit]);
  }

  /**
   * Get transaction summary for user
   */
  async getTransactionSummary(userId: string): Promise<{
    total_transactions: number;
    total_volume: string;
    pending_count: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_volume,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count
      FROM transactions
      WHERE user_id = $1
    `;

    const result = await this.queryOne<{
      total_transactions: string;
      total_volume: string;
      pending_count: string;
    }>(query, [userId]);

    return {
      total_transactions: parseInt(result?.total_transactions || '0', 10),
      total_volume: result?.total_volume || '0',
      pending_count: parseInt(result?.pending_count || '0', 10),
    };
  }

  /**
   * Get transactions by chain
   */
  async getTransactionsByChain(
    userId: string,
    chainId: ChainId
  ): Promise<Transaction[]> {
    const query = `
      SELECT * FROM transactions
      WHERE user_id = $1 AND chain_id = $2
      ORDER BY created_at DESC
    `;
    return this.query<Transaction>(query, [userId, chainId]);
  }
}
