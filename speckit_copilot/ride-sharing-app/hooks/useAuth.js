'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url) =>
  fetch(url, {
    credentials: 'include',
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  });

export function useAuth() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fetch current user from the cookie-based session
  const { data: user, error, isLoading } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Return undefined while mounting to avoid hydration mismatch
  if (!mounted) {
    return {
      user: undefined,
      isLoading: true,
      isAuthenticated: false,
      logout,
      error: null,
    };
  }

  return {
    user: user?.user || null,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
    error,
  };
}
