'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, Wallet, Copy, CheckCircle, RefreshCw, Settings, User, Layers } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import Link from 'next/link';
import { MultiChainBalance } from '@/components/wallet/MultiChainBalance';
import { CrossChainTransfer } from '@/components/wallet/CrossChainTransfer';
import { type ChainId } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [totalBalance, setTotalBalance] = useState('0');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCrossChainTransfer, setShowCrossChainTransfer] = useState(false);
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);

  useEffect(() => {
    // Check for token in URL query parameters (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      // Save token from URL to localStorage
      localStorage.setItem('deo_token', tokenFromUrl);
      // Clean up URL by removing token parameter
      window.history.replaceState({}, document.title, '/dashboard');
      loadData(tokenFromUrl);
      return;
    }
    
    // Check for existing token in localStorage
    const token = localStorage.getItem('deo_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    loadData(token);
  }, [router]);

  const loadData = async (token: string) => {
    try {
      const [userRes, balanceRes, txRes] = await Promise.all([
        fetch('/api/user', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/circle/balances', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/transactions?limit=10', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Check if token is invalid/expired
      if (userRes.status === 401) {
        console.error('Invalid or expired token');
        localStorage.removeItem('deo_token');
        router.push('/auth/login?error=session_expired');
        return;
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      } else {
        console.error('Failed to load user:', await userRes.text());
      }
      
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setTotalBalance(data.total_balance || '0');
      } else {
        console.warn('Failed to load balance:', await balanceRes.text());
      }
      
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      } else {
        console.warn('Failed to load transactions:', await txRes.text());
      }
    } catch (error) {
      console.error('Load error:', error);
      // Don't redirect on network errors, just show what we have
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deo_token');
    localStorage.removeItem('circle_user_token');
    localStorage.removeItem('circle_encryption_key');
    router.push('/auth/login');
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('deo_token');
    if (!token) return;
    
    setRefreshing(true);
    await loadData(token);
    setRefreshing(false);
  };

  const copyAddress = async () => {
    if (!user?.smart_wallet_address) return;
    
    try {
      await navigator.clipboard.writeText(user.smart_wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTransferClick = (chainId: ChainId) => {
    setSelectedChain(chainId);
    setShowCrossChainTransfer(true);
  };

  const handleTransferSuccess = () => {
    setShowCrossChainTransfer(false);
    setSelectedChain(null);
    handleRefresh();
  };

  const formatAddress = (address: string) => {
    if (!address) return 'No wallet';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-brand-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold">DEO</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">DEO Finance</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!</h2>
          <p className="text-gray-600 mt-1">Manage your digital assets and stablecoin portfolio</p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Multi-Chain Wallet & Transfer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Chain Wallet Display */}
            {user?.smart_wallet_address && (
              <MultiChainBalance
                walletAddress={user.smart_wallet_address}
                onTransferClick={handleTransferClick}
              />
            )}

            {/* Cross-Chain Transfer Modal */}
            {showCrossChainTransfer && user?.smart_wallet_address && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <CrossChainTransfer
                    walletAddress={user.smart_wallet_address}
                    initialSourceChain={selectedChain || '1'}
                    onSuccess={handleTransferSuccess}
                    onCancel={() => setShowCrossChainTransfer(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600"
                  size="lg"
                  onClick={() => setShowCrossChainTransfer(true)}
                >
                  <Layers className="mr-2 h-5 w-5" />
                  Cross-Chain Transfer
                </Button>
                <Button className="w-full" variant="outline" size="lg">
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Send Money
                </Button>
                <Button className="w-full" variant="outline" size="lg">
                  <ArrowDownLeft className="mr-2 h-5 w-5" />
                  Receive Money
                </Button>
                <Button className="w-full" variant="outline" size="lg">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Buy USDC
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">KYC Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user?.kyc_status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : user?.kyc_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.kyc_status || 'Not Started'}
                    </span>
                  </div>
                </div>
                {user?.kyc_status !== 'approved' && (
                  <Button variant="outline" className="w-full" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Complete KYC
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-600">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tx.transaction_type}</p>
                      <p className="text-sm text-gray-600">{formatRelativeTime(tx.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(tx.amount)}</p>
                      <p className="text-sm text-gray-600 capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
