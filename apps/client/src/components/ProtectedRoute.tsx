import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1️⃣ Loading → show spinner, do NOT redirect
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

  // 2️⃣ If not authenticated → redirect to login (only after loading finishes)
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}