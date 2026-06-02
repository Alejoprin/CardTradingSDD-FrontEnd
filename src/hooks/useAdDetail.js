import { useState, useEffect, useCallback } from 'react';
import adService from '../services/adService';
import { parseApiError } from '../utils/errors';

function useAdDetail(adId) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAd = useCallback(async () => {
    if (!adId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adService.getAd(adId);
      setAd(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [adId]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  return { ad, loading, error, refetch: fetchAd };
}

export default useAdDetail;
