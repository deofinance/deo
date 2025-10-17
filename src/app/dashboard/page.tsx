'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [totalBalance, setTotalBalance] = useState('0');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    router.push('/auth/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DEO Finance</h1>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!</h2>
          <p className="text-gray-600">Manage your digital assets</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-sm text-gray-600">USDC</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold capitalize">{user?.kyc_status || 'Pending'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" size="sm">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Send
              </Button>
              <Button className="w-full" variant="outline" size="sm">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Receive
              </Button>
            </CardContent>
          </Card>
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
