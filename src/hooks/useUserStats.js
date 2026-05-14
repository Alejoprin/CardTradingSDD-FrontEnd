import { useState, useEffect, useCallback } from 'react';
import tradeService from '../services/tradeService';
import cardService from '../services/cardService';
import { parseApiError } from '../utils/errors';

function useUserStats(userId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [tradesData, cardsData] = await Promise.all([
        tradeService.listTrades({ status: 'PENDING', size: 1, page: 0 }),
        cardService.getUserInventory(userId, { size: 1, page: 0 }),
      ]);

      setStats({
        totalCards: cardsData.page?.totalElements ?? 0,
        pendingTrades: tradesData.page?.totalElements ?? 0,
        completedTrades: null,
        rating: null,
      });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export default useUserStats;
