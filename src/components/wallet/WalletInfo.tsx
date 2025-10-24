/**
 * Wallet Info Component
 * Displays Circle wallet information and balances
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Copy, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { getCircleCredentials } from '@/lib/utils/circleWallet';

interface WalletBalance {
  token: string;
  amount: string;
  updateDate: string;
}

interface WalletInfoProps {
  walletAddress?: string;
  className?: string;
}

export function WalletInfo({ walletAddress, className = '' }: WalletInfoProps) {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balances
  const fetchBalances = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/circle/balances', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('deo_token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch balances');
      }

      setBalances(data.balances || []);
    } catch (err) {
      console.error('Balance fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  // Load balances on mount
  useEffect(() => {
    if (walletAddress) {
      fetchBalances();
    }
  }, [walletAddress]);

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Calculate total balance
  const totalBalance = balances.reduce((sum, b) => {
    return sum + parseFloat(b.amount || '0');
  }, 0);

  if (!walletAddress) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Smart Wallet
          </CardTitle>
          <CardDescription>No wallet connected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please login to view your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Smart Contract Account (SCA)
        </CardTitle>
        <CardDescription>Your Circle wallet address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Address</p>
            <p className="text-sm font-mono font-medium break-all">
              {walletAddress}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
              title="Copy address"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="View on explorer"
              onClick={() =>
                window.open(
                  `https://sepolia.etherscan.io/address/${walletAddress}`,
                  '_blank'
                )
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Total Balance */}
        <div className="p-4 bg-gradient-to-r from-brand-50 to-teal-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            ${totalBalance.toFixed(2)}
          </p>
        </div>

        {/* Token Balances */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Token Balances</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchBalances}
              disabled={loading}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {balances.length === 0 && !loading && !error && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No token balances found
            </div>
          )}

          {balances.map((balance, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-400 to-teal-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {balance.token.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {balance.token}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(balance.updateDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {parseFloat(balance.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  ${parseFloat(balance.amount).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Wallet Features */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Gasless transactions</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Multi-chain support</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Non-custodial</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>ERC-4337 compliant</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
