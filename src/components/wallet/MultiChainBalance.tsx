/**
 * Multi-Chain Balance Component
 * Displays USDC balances across all supported chains
 * Shows Layer 2 indicators and chain-specific information
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  RefreshCw, 
  TrendingUp, 
  Layers,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { useSmartWallet } from '@/hooks/useSmartWallet';
import { formatCurrency } from '@/lib/utils/format';
import { type ChainId } from '@/types';

interface MultiChainBalanceProps {
  walletAddress: string;
  className?: string;
  onTransferClick?: (chainId: ChainId) => void;
}

export function MultiChainBalance({ 
  walletAddress, 
  className = '',
  onTransferClick 
}: MultiChainBalanceProps) {
  const { 
    balances, 
    totalBalance, 
    isLoading, 
    error, 
    refreshBalances,
    getSupportedChains,
    isLayer2
  } = useSmartWallet(walletAddress);

  const [refreshing, setRefreshing] = useState(false);

  const supportedChains = getSupportedChains();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  };

  const getChainIcon = (chainId: ChainId): string => {
    const chain = supportedChains.find((c) => c.chainId === chainId);
    return chain?.icon || '◆';
  };

  const getChainName = (chainId: ChainId): string => {
    const chain = supportedChains.find((c) => c.chainId === chainId);
    return chain?.name || 'Unknown';
  };

  const getExplorerUrl = (chainId: ChainId): string => {
    const explorers: Record<ChainId, string> = {
      '1': `https://etherscan.io/address/${walletAddress}`,
      '137': `https://polygonscan.com/address/${walletAddress}`,
      '42161': `https://arbiscan.io/address/${walletAddress}`,
      '10': `https://optimistic.etherscan.io/address/${walletAddress}`,
      '56': `https://bscscan.com/address/${walletAddress}`,
    };
    return explorers[chainId];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand-600" />
            <CardTitle>Multi-Chain Wallet</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || refreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          USDC balances across all networks
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Balance Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-teal-600 p-6 text-white">
          <div className="relative z-10">
            <p className="text-sm font-medium text-white/80 mb-1">
              Total Balance
            </p>
            <p className="text-4xl font-bold mb-2">
              {formatCurrency(totalBalance)}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Across {balances.length} networks</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 opacity-10">
            <Layers className="h-32 w-32" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Chain Balances */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Network Balances
            <Badge variant="secondary" className="text-xs">
              {balances.length} Active
            </Badge>
          </h4>

          {isLoading && balances.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {supportedChains.map((chain) => {
                const balance = balances.find((b) => b.chainId === chain.chainId);
                const balanceUSD = balance?.balanceUSD || 0;
                const balanceAmount = balance?.balance || '0.00';

                return (
                  <div
                    key={chain.chainId}
                    className="group relative p-4 border border-gray-200 rounded-lg hover:border-brand-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* Chain Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-teal-100">
                          <span className="text-xl">{chain.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{chain.name}</p>
                            {chain.isLayer2 && (
                              <Badge variant="outline" className="text-xs border-teal-300 text-teal-700">
                                <Layers className="h-3 w-3 mr-1" />
                                L2
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {balanceAmount} USDC
                          </p>
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(balanceUSD)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {((balanceUSD / totalBalance) * 100 || 0).toFixed(1)}%
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {balanceUSD > 0 && onTransferClick && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onTransferClick(chain.chainId)}
                              className="h-8 w-8 p-0"
                              title="Transfer"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getExplorerUrl(chain.chainId), '_blank')}
                            className="h-8 w-8 p-0"
                            title="View on explorer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Layer 2 Info */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-teal-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-900 mb-1">
                Layer 2 Networks Active
              </p>
              <p className="text-xs text-teal-700">
                Enjoy lower fees and faster transactions on Polygon, Arbitrum, and Optimism
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
