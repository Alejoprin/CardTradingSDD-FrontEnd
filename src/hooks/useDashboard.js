import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import tradeService from '../services/tradeService';
import cardService from '../services/cardService';
import { parseApiError } from '../utils/errors';

function useDashboard(userId) {
  const [stats, setStats] = useState(null);
  const [pendingTrades, setPendingTrades] = useState([]);
  const [recentCards, setRecentCards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [profileData, tradesData, cardsData, activityData] = await Promise.all([
        userService.getUserProfile(userId),
        tradeService.listTrades({ status: 'pending', size: 5 }),
        cardService.getUserInventory(userId, { size: 4 }),
        userService.getActivityFeed(userId).catch(() => ({ activities: [] })),
      ]);

      setStats(profileData.stats || {});
      setPendingTrades(tradesData.trades || []);
      setRecentCards(cardsData.cards || []);
      setActivities((activityData.activities || []).slice(0, 10));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { stats, pendingTrades, recentCards, activities, loading, error };
}

export default useDashboard;
