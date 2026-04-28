import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import { parseApiError } from '../utils/errors';

function useAdminStats(period = '7d') {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats({ period });
      setStats(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export default useAdminStats;
