/**
 * Smart Wallet Service
 * Comprehensive multi-chain wallet management with Circle SCA integration
 * Supports Ethereum, Polygon, Arbitrum, Optimism, and BSC
 */

import { ChainId, StablecoinSymbol } from '@/types';

export interface WalletBalance {
  chainId: ChainId;
  chainName: string;
  token: StablecoinSymbol;
  balance: string;
  balanceUSD: number;
  isLayer2: boolean;
  lastUpdated: Date;
}

export interface MultiChainWalletState {
  address: string;
  balances: WalletBalance[];
  totalBalanceUSD: number;
  supportedChains: ChainId[];
  isLoading: boolean;
}

export interface CrossChainTransferParams {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
  amount: string;
  token: StablecoinSymbol;
  recipientAddress?: string; // If not provided, uses same wallet on destination
}

export class SmartWalletService {
  private walletAddress: string | null = null;
  private userToken: string | null = null;

  /**
   * Initialize wallet service
   */
  initialize(walletAddress: string, userToken: string): void {
    this.walletAddress = walletAddress;
    this.userToken = userToken;
  }

  /**
   * Get multi-chain balances for the wallet
   */
  async getMultiChainBalances(): Promise<WalletBalance[]> {
    if (!this.walletAddress) {
      throw new Error('Wallet not initialized');
    }

    try {
      const response = await fetch('/api/wallet/multi-chain-balances', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch balances');
      }

      const data = await response.json();
      return data.balances;
    } catch (error) {
      console.error('Failed to fetch multi-chain balances:', error);
      throw error;
    }
  }

  /**
   * Get balance for specific chain
   */
  async getChainBalance(chainId: ChainId): Promise<WalletBalance> {
    if (!this.walletAddress) {
      throw new Error('Wallet not initialized');
    }

    try {
      const response = await fetch(`/api/wallet/balance/${chainId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch balance');
      }

      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error(`Failed to fetch balance for chain ${chainId}:`, error);
      throw error;
    }
  }

  /**
   * Initiate cross-chain transfer using Circle CCTP V2
   */
  async initiateCrossChainTransfer(
    params: CrossChainTransferParams
  ): Promise<{ transferId: string; attestation: string }> {
    if (!this.walletAddress) {
      throw new Error('Wallet not initialized');
    }

    try {
      const response = await fetch('/api/wallet/cctp/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
        },
        body: JSON.stringify({
          ...params,
          fromAddress: this.walletAddress,
          toAddress: params.recipientAddress || this.walletAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate transfer');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to initiate cross-chain transfer:', error);
      throw error;
    }
  }

  /**
   * Get CCTP transfer status
   */
  async getCCTPTransferStatus(
    transferId: string
  ): Promise<{
    status: 'pending' | 'attested' | 'completed' | 'failed';
    attestation?: string;
    destinationTxHash?: string;
  }> {
    try {
      const response = await fetch(`/api/wallet/cctp/status/${transferId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transfer status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch CCTP transfer status:', error);
      throw error;
    }
  }

  /**
   * Get supported chains with their metadata
   */
  getSupportedChains(): Array<{
    chainId: ChainId;
    name: string;
    isLayer2: boolean;
    icon: string;
    nativeToken: string;
  }> {
    return [
      {
        chainId: '1',
        name: 'Ethereum',
        isLayer2: false,
        icon: '⟠',
        nativeToken: 'ETH',
      },
      {
        chainId: '137',
        name: 'Polygon',
        isLayer2: true,
        icon: '⬡',
        nativeToken: 'MATIC',
      },
      {
        chainId: '42161',
        name: 'Arbitrum',
        isLayer2: true,
        icon: '◆',
        nativeToken: 'ETH',
      },
      {
        chainId: '10',
        name: 'Optimism',
        isLayer2: true,
        icon: '○',
        nativeToken: 'ETH',
      },
      {
        chainId: '56',
        name: 'BSC',
        isLayer2: false,
        icon: '◇',
        nativeToken: 'BNB',
      },
    ];
  }

  /**
   * Calculate total balance across all chains
   */
  calculateTotalBalance(balances: WalletBalance[]): number {
    return balances.reduce((total, balance) => total + balance.balanceUSD, 0);
  }

  /**
   * Check if chain is Layer 2
   */
  isLayer2Chain(chainId: ChainId): boolean {
    return ['137', '42161', '10'].includes(chainId);
  }

  /**
   * Get chain name
   */
  getChainName(chainId: ChainId): string {
    const chains: Record<ChainId, string> = {
      '1': 'Ethereum',
      '137': 'Polygon',
      '42161': 'Arbitrum',
      '10': 'Optimism',
      '56': 'BSC',
    };
    return chains[chainId] || 'Unknown';
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(chainId: ChainId, txHash: string): string {
    const explorers: Record<ChainId, string> = {
      '1': 'https://etherscan.io',
      '137': 'https://polygonscan.com',
      '42161': 'https://arbiscan.io',
      '10': 'https://optimistic.etherscan.io',
      '56': 'https://bscscan.com',
    };
    return `${explorers[chainId]}/tx/${txHash}`;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string | null {
    return this.walletAddress;
  }

  /**
   * Clear wallet data
   */
  clear(): void {
    this.walletAddress = null;
    this.userToken = null;
  }
}

// Singleton instance
export const smartWalletService = new SmartWalletService();
