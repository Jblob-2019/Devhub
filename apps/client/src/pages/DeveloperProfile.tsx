import React from 'react';
import { Page } from '../types';
import { LoginPage } from './Auth';
import { useAuth } from '../hooks/useAuth';

export function DeveloperProfilePage({ onNav }: { onNav: (page: Page) => void }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading…</div>;
  }
  if (!user) {
    return <LoginPage onNav={onNav} />;
  }
  // Stub implementation – original detailed UI omitted for brevity.
  return <div className="p-4 text-[#f0f6fc]">Developer Profile Page (stub)</div>;
}
