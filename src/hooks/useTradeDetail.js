import { useState, useEffect, useCallback } from 'react';
import tradeService from '../services/tradeService';
import { parseApiError } from '../utils/errors';

function useTradeDetail(tradeId) {
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrade = useCallback(async () => {
    if (!tradeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tradeService.getTrade(tradeId);
      setTrade(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  return { trade, loading, error, refetch: fetchTrade };
}

export default useTradeDetail;
