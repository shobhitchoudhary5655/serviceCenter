'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is logged in
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='));
      if (token) {
        router.push('/dashboard');
        setChecking(false);
        return;
      }

      // Check if admin user exists
      try {
        const response = await fetch('/api/auth/setup');
        const data = await response.json();
        if (data.adminExists) {
          router.push('/login');
        } else {
          router.push('/setup');
        }
      } catch (error) {
        // On error, try setup page
        router.push('/setup');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}

