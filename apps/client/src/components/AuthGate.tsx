import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGate({ children, requireAuth = false, redirectTo }: AuthGateProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while auth is being initialized
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b141c] flex items-center justify-center" role="status" aria-label="Loading authentication">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#8b949e] font-mono">Loading DevHub...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but no user, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no auth required and user exists, redirect to home (for login/register pages)
  if (!requireAuth && user && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}