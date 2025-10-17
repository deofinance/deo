// Balance hook
import { useState, useEffect } from 'react';

interface Balance {
  chain_id: string;
  stablecoin: string;
  balance: string;
  available_balance: string;
}

export function useBalance(token: string | null) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totalBalance, setTotalBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadBalances = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/circle/balances', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBalances(data.balances || []);
        setTotalBalance(data.total_balance || '0');
      } else {
        setError('Failed to load balances');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setLoading(true);
    loadBalances();
  };

  return {
    balances,
    totalBalance,
    loading,
    error,
    refresh,
  };
}
