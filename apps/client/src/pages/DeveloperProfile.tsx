import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUser } from '../services/githubApi';

export function DeveloperProfilePage() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');
  const [dev, setDev] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    const fetchDev = async () => {
      try {
        const data = await getUser(username);
        setDev(data);
      } catch (e) {
        console.error('Failed to fetch developer', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDev();
  }, [username]);

  if (!username) {
    return <div className="p-4 text-[#f0f6fc]">Username not specified in URL.</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading…</div>;
  }

  if (!dev) {
    return <div className="p-4 text-[#f0f6fc]">Developer not found.</div>;
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      <h1 className="text-2xl font-bold text-[#f0f6fc] mb-4">{dev.name ?? dev.login}</h1>
      <p className="text-[#8b949e] mb-2">@{dev.login}</p>
      {dev.avatar_url && (
        <img src={dev.avatar_url} alt={dev.login} className="w-24 h-24 rounded-full mb-4" />
      )}
      <p className="text-[#c9d1d9]">{dev.bio}</p>
    </div>
  );
}
