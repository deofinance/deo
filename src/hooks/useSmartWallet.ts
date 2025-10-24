/**
 * Smart Wallet Hook
 * React hook for multi-chain wallet management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { smartWalletService, type WalletBalance } from '@/lib/services/smartWalletService';
import { type ChainId } from '@/types';

export interface UseSmartWalletReturn {
  // State
  balances: WalletBalance[];
  totalBalance: number;
  isLoading: boolean;
  error: string | null;
  walletAddress: string | null;
  
  // Actions
  refreshBalances: () => Promise<void>;
  getChainBalance: (chainId: ChainId) => WalletBalance | undefined;
  getTotalBalance: () => number;
  
  // Utilities
  getSupportedChains: () => ReturnType<typeof smartWalletService.getSupportedChains>;
  isLayer2: (chainId: ChainId) => boolean;
}

export function useSmartWallet(walletAddress?: string): UseSmartWalletReturn {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(walletAddress || null);

  /**
   * Initialize wallet service
   */
  useEffect(() => {
    if (walletAddress) {
      const userToken = localStorage.getItem('deo_token') || '';
      smartWalletService.initialize(walletAddress, userToken);
      setAddress(walletAddress);
    }
  }, [walletAddress]);

  /**
   * Fetch multi-chain balances
   */
  const refreshBalances = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedBalances = await smartWalletService.getMultiChainBalances();
      setBalances(fetchedBalances);
      
      const total = smartWalletService.calculateTotalBalance(fetchedBalances);
      setTotalBalance(total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      console.error('Failed to refresh balances:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  /**
   * Load balances on mount and when address changes
   */
  useEffect(() => {
    if (address) {
      refreshBalances();
    }
  }, [address, refreshBalances]);

  /**
   * Get balance for specific chain
   */
  const getChainBalance = useCallback(
    (chainId: ChainId): WalletBalance | undefined => {
      return balances.find((b: WalletBalance) => b.chainId === chainId);
    },
    [balances]
  );

  /**
   * Get total balance
   */
  const getTotalBalance = useCallback((): number => {
    return totalBalance;
  }, [totalBalance]);

  /**
   * Get supported chains
   */
  const getSupportedChains = useCallback(() => {
    return smartWalletService.getSupportedChains();
  }, []);

  /**
   * Check if chain is Layer 2
   */
  const isLayer2 = useCallback((chainId: ChainId): boolean => {
    return smartWalletService.isLayer2Chain(chainId);
  }, []);

  return {
    balances,
    totalBalance,
    isLoading,
    error,
    walletAddress: address,
    refreshBalances,
    getChainBalance,
    getTotalBalance,
    getSupportedChains,
    isLayer2,
  };
}
