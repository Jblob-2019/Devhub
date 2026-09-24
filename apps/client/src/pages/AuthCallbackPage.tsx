import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function AuthCallbackPage() {
  const { refresh, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      // Wait for auth context to initialize (loading becomes false)
      // The session cookie was set by the backend redirect, so refresh() will pick it up
      try {
        await refresh();
        if (mounted && user) {
          // Successfully authenticated - go to dashboard
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('[AUTH] Callback error:', error);
        if (mounted) {
          // On error, go to login with error message
          navigate('/login?error=oauth_failed', { replace: true });
        }
      }
    };

    // Small delay to ensure cookie is available
    const timer = setTimeout(handleCallback, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [refresh, navigate, user, authLoading]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12 page-enter">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#8b949e]">Completing GitHub sign-in...</p>
      </div>
    </div>
  );
}