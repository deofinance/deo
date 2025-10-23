'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, Send, ArrowLeftRight, Loader2, RefreshCw } from 'lucide-react';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/circle/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || '0.00');
        setWalletAddress(data.address || '');
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Send USDC
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch('/api/circle/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient,
          amount: parseFloat(amount),
          chain_id: '1', // Ethereum mainnet
          stablecoin: 'USDC',
        }),
      });

      if (response.ok) {
        alert('Transfer initiated successfully!');
        setRecipient('');
        setAmount('');
        fetchBalance(); // Refresh balance
      } else {
        const error = await response.json();
        alert(`Transfer failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send USDC');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Smart Wallet</h1>
        <p className="text-slate-600">Manage your multi-chain stablecoin assets</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-emerald-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Total Balance</CardTitle>
                <CardDescription>Across all networks</CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              Gasless
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span className="text-slate-600">Loading balance...</span>
            </div>
          ) : (
            <div>
              <p className="text-4xl font-bold text-slate-900 mb-2">
                ${parseFloat(balance).toFixed(2)}
              </p>
              <p className="text-sm text-slate-600 mb-4">USDC Balance</p>
              {walletAddress && (
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
                  <p className="text-sm font-mono text-slate-900 break-all">{walletAddress}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={fetchBalance}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Bridge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send USDC Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            <CardTitle>Send USDC</CardTitle>
          </div>
          <CardDescription>Transfer USDC to another wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={sending}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={sending}
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-sm text-slate-500 font-medium">USDC</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Available: ${parseFloat(balance).toFixed(2)}
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={sending || loading || !recipient || !amount}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send USDC
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <TransactionHistory />
    </div>
  );
}
