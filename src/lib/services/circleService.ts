// Circle Web3 Services integration
import { BaseService } from './baseService';

export class CircleService extends BaseService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.CIRCLE_API_KEY || '';
    this.baseUrl = 'https://api.circle.com/v1/w3s';
  }

  /**
   * Send OTP to email
   */
  async sendOTP(email: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/users/pin/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    return { success: true };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    email: string,
    pin: string
  ): Promise<{ userToken: string; encryptionKey: string }> {
    const response = await fetch(`${this.baseUrl}/users/pin/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, pin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid verification code');
    }

    const data = await response.json();
    return {
      userToken: data.data.userToken,
      encryptionKey: data.data.encryptionKey,
    };
  }

  /**
   * Create Circle wallet
   */
  async createWallet(
    userId: string,
    userToken: string,
    blockchains: string[] = ['ETH-SEPOLIA', 'MATIC-AMOY']
  ): Promise<{
    walletId: string;
    address: string;
    blockchain: string;
  }> {
    const response = await fetch(`${this.baseUrl}/wallets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-User-Token': userToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: `wallet-${userId}-${Date.now()}`,
        blockchains,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create wallet');
    }

    const data = await response.json();
    return {
      walletId: data.data.walletId,
      address: data.data.address,
      blockchain: data.data.blockchain,
    };
  }

  /**
   * Get wallet balances
   */
  async getWalletBalances(
    walletId: string,
    userToken: string
  ): Promise<
    Array<{
      token: string;
      amount: string;
      updateDate: string;
    }>
  > {
    const response = await fetch(`${this.baseUrl}/wallets/${walletId}/balances`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-User-Token': userToken,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get balances');
    }

    const data = await response.json();
    return data.data.tokenBalances || [];
  }

  /**
   * Initiate transfer
   */
  async initiateTransfer(params: {
    userToken: string;
    walletId: string;
    destinationAddress: string;
    amount: string;
    tokenId: string;
    blockchain: string;
  }): Promise<{
    challengeId: string;
    status: string;
  }> {
    const response = await fetch(`${this.baseUrl}/user/transactions/transfer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-User-Token': params.userToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: `transfer-${Date.now()}`,
        walletId: params.walletId,
        destinationAddress: params.destinationAddress,
        amounts: [params.amount],
        tokenId: params.tokenId,
        blockchain: params.blockchain,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initiate transfer');
    }

    const data = await response.json();
    return {
      challengeId: data.data.challengeId,
      status: data.data.status,
    };
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    transactionId: string,
    userToken: string
  ): Promise<{
    status: string;
    txHash?: string;
  }> {
    const response = await fetch(
      `${this.baseUrl}/transactions/${transactionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'X-User-Token': userToken,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get transaction status');
    }

    const data = await response.json();
    return {
      status: data.data.state,
      txHash: data.data.txHash,
    };
  }
}
