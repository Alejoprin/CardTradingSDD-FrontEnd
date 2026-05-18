import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import useUserStats from './useUserStats';
import { parseApiError } from '../utils/errors';

function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { stats, loading: statsLoading } = useUserStats(userId);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const profileWithStats = profile ? { ...profile, stats: stats ?? profile.stats } : null;

  return { profile: profileWithStats, loading: loading || statsLoading, error, refetch: fetchProfile };
}

export default useProfile;
