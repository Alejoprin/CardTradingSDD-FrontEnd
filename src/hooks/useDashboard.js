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
      const [profileData, tradesData, cardsData] = await Promise.all([
        userService.getUserProfile(userId),
        tradeService.listTrades({ status: 'pending', size: 5, page: 0 }),
        cardService.getUserInventory(userId, { size: 4, page: 0 }),
      ]);

      setStats({
        totalCards: cardsData.totalElements || 0,
        pendingTrades: tradesData.totalElements || 0,
        username: profileData.username,
      });
      setPendingTrades(tradesData.content || []);
      setRecentCards((cardsData.content || []).map(item => ({
        id: item.cardId,
        name: item.cardName,
        rarity: item.rarity,
      })));
      setActivities([]);
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
