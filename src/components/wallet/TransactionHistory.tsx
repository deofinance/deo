'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';

interface Transaction {
  id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'swap';
  amount: string;
  stablecoin: string;
  chain_id: string;
  status: 'pending' | 'completed' | 'failed';
  recipient_address?: string;
  sender_address?: string;
  transaction_hash?: string;
  created_at: string;
}

interface TransactionHistoryProps {
  walletId?: string;
}

export function TransactionHistory({ walletId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('deo_token');
      
      if (!token) return;

      const response = await fetch('/api/transactions?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletId]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'deposit') return 'text-emerald-600';
    if (type === 'withdrawal' || type === 'transfer') return 'text-slate-900';
    return 'text-slate-600';
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.transaction_type === 'withdrawal' || tx.transaction_type === 'transfer';
    if (filter === 'received') return tx.transaction_type === 'deposit';
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View all your wallet activity</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            All
          </Button>
          <Button
            variant={filter === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
            className={filter === 'sent' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Sent
          </Button>
          <Button
            variant={filter === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('received')}
            className={filter === 'received' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Received
          </Button>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div>
                      <div className="w-24 h-4 bg-slate-200 rounded mb-2" />
                      <div className="w-32 h-3 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions yet</h3>
            <p className="text-slate-600 text-sm">
              Your transaction history will appear here once you make your first transaction.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.transaction_type === 'deposit' 
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getTransactionIcon(tx.transaction_type)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 capitalize">
                        {tx.transaction_type}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{formatTimeAgo(tx.created_at)}</span>
                      {tx.chain_id && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{tx.chain_id}</span>
                        </>
                      )}
                    </div>
                    {tx.recipient_address && (
                      <p className="text-xs text-slate-500 mt-1 font-mono truncate max-w-[200px]">
                        To: {tx.recipient_address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(tx.transaction_type)}`}>
                      {tx.transaction_type === 'deposit' ? '+' : '-'}${formatCurrency(parseFloat(tx.amount))}
                    </p>
                    <p className="text-xs text-slate-500">{tx.stablecoin}</p>
                  </div>
                  {tx.transaction_hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(`https://polygonscan.com/tx/${tx.transaction_hash}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
