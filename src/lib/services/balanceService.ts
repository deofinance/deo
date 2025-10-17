// Balance service for managing user balances
import { BaseService } from './baseService';
import { StablecoinBalance, ChainId, StablecoinSymbol } from '@/types';

export class BalanceService extends BaseService {
  /**
   * Get balance for user on specific chain
   */
  async getBalance(
    userId: string,
    chainId: ChainId,
    stablecoin: StablecoinSymbol = 'USDC'
  ): Promise<StablecoinBalance | null> {
    const query = `
      SELECT * FROM stablecoin_balances
      WHERE user_id = $1 AND chain_id = $2 AND stablecoin = $3
    `;
    return this.queryOne<StablecoinBalance>(query, [userId, chainId, stablecoin]);
  }

  /**
   * Get all balances for user
   */
  async getAllBalances(userId: string): Promise<StablecoinBalance[]> {
    const query = `
      SELECT * FROM stablecoin_balances
      WHERE user_id = $1
      ORDER BY chain_id
    `;
    return this.query<StablecoinBalance>(query, [userId]);
  }

  /**
   * Update or create balance
   */
  async updateBalance(params: {
    userId: string;
    walletId: string;
    chainId: ChainId;
    stablecoin: StablecoinSymbol;
    balance: string;
    contractAddress: string;
  }): Promise<StablecoinBalance> {
    const query = `
      INSERT INTO stablecoin_balances (
        user_id,
        wallet_id,
        chain_id,
        stablecoin,
        balance,
        contract_address,
        last_sync_at
      ) VALUES ($1, $2, $3, $4, $5, $6, now())
      ON CONFLICT (user_id, stablecoin, chain_id, wallet_id)
      DO UPDATE SET
        balance = EXCLUDED.balance,
        last_sync_at = now()
      RETURNING *
    `;

    const balance = await this.queryOne<StablecoinBalance>(query, [
      params.userId,
      params.walletId,
      params.chainId,
      params.stablecoin,
      params.balance,
      params.contractAddress,
    ]);

    if (!balance) {
      throw new Error('Failed to update balance');
    }

    return balance;
  }

  /**
   * Lock balance (for pending transactions)
   */
  async lockBalance(
    userId: string,
    chainId: ChainId,
    amount: string
  ): Promise<void> {
    const query = `
      UPDATE stablecoin_balances
      SET locked_balance = locked_balance + $1
      WHERE user_id = $2 AND chain_id = $3
    `;
    await this.query(query, [amount, userId, chainId]);
  }

  /**
   * Unlock balance
   */
  async unlockBalance(
    userId: string,
    chainId: ChainId,
    amount: string
  ): Promise<void> {
    const query = `
      UPDATE stablecoin_balances
      SET locked_balance = GREATEST(locked_balance - $1, 0)
      WHERE user_id = $2 AND chain_id = $3
    `;
    await this.query(query, [amount, userId, chainId]);
  }

  /**
   * Get total balance across all chains
   */
  async getTotalBalance(userId: string): Promise<string> {
    const query = `
      SELECT COALESCE(SUM(balance), 0) as total
      FROM stablecoin_balances
      WHERE user_id = $1
    `;
    const result = await this.queryOne<{ total: string }>(query, [userId]);
    return result?.total || '0';
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(
    userId: string,
    chainId: ChainId,
    amount: string
  ): Promise<boolean> {
    const balance = await this.getBalance(userId, chainId);
    if (!balance) return false;

    const available = parseFloat(balance.available_balance);
    const required = parseFloat(amount);
    return available >= required;
  }
}
