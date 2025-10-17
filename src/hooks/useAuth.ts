// Authentication hook
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  smart_wallet_address: string;
  kyc_status: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('deo_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    loadUser(storedToken);
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('deo_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem('deo_token', newToken);
    setToken(newToken);
    loadUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('deo_token');
    localStorage.removeItem('circle_user_token');
    localStorage.removeItem('circle_encryption_key');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  const requireAuth = () => {
    if (!loading && !token) {
      router.push('/auth/login');
    }
  };

  return {
    user,
    token,
    loading,
    login,
    logout,
    requireAuth,
    isAuthenticated: !!token,
  };
}
