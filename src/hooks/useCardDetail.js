import { useState, useEffect, useCallback } from 'react';
import cardService from '../services/cardService';
import { parseApiError } from '../utils/errors';

function useCardDetail(cardId) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCard = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cardService.getCard(cardId);
      setCard(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  return { card, loading, error, refetch: fetchCard };
}

export default useCardDetail;
