'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Wallet, CreditCard, TrendingUp, Sparkles, Plus, Bell, ChevronRight } from 'lucide-react';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import { CreateWalletModal } from '@/components/wallet/CreateWalletModal';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [totalBalance, setTotalBalance] = useState('0');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

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
      const [userRes, balanceRes] = await Promise.all([
        fetch('/api/user', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/circle/balance', { headers: { Authorization: `Bearer ${token}` } })
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
        setTotalBalance(data.balance || '0');
        setHasWallet(!!data.address);
      } else {
        console.warn('Failed to load balance:', await balanceRes.text());
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
    router.push('/auth/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <header className="bg-white/60 backdrop-blur-xl border-b border-emerald-200/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DF</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">DEO Finance</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-600">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white mb-8">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold">Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!</h2>
                </div>
                <p className="text-emerald-100 text-lg">Experience the future of digital finance</p>
              </div>
              {hasWallet ? (
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowCreateWallet(true)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Create Wallet
                </Button>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Link href="/accounts/wallet" className="group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="h-5 w-5" />
                    <span className="font-medium">Smart Wallet</span>
                  </div>
                  <p className="text-2xl font-bold">${totalBalance}</p>
                  <div className="flex items-center text-sm text-emerald-100 mt-1">
                    <span>View Details</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Total Earned</span>
                </div>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-emerald-100 mt-1">+0% this month</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">KYC Status</span>
                </div>
                <p className="text-xl font-semibold capitalize">{user?.kyc_status || 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/accounts/wallet">
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-emerald-200/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">View Wallet</CardTitle>
                    <p className="text-sm text-slate-600">Manage your USDC</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Available Balance</p>
                    <p className="text-2xl font-bold text-slate-900">${totalBalance}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-teal-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Cards</CardTitle>
                  <p className="text-sm text-slate-600">Virtual & Physical</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Cards</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-cyan-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Invest</CardTitle>
                  <p className="text-sm text-slate-600">Earn up to 8% APY</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Invested</p>
                  <p className="text-2xl font-bold text-slate-900">$0.00</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Wallet Modal */}
      <CreateWalletModal 
        open={showCreateWallet} 
        onOpenChange={setShowCreateWallet}
      />
    </div>
  );
}
