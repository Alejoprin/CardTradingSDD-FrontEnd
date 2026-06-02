import { useState, useEffect, useCallback } from 'react';
import adService from '../services/adService';
import { parseApiError } from '../utils/errors';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

function useAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState('SELL');
  const [cardSearch, setCardSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: page - 1, size: DEFAULT_PAGE_SIZE, type: activeTab };
      if (cardSearch) params.cardName = cardSearch;
      const data = await adService.listAds(params);
      setAds(data.content || []);
      setPagination({ page, totalPages: data.page?.totalPages || 1, total: data.page?.totalElements || 0 });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, cardSearch, page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const changeTab = useCallback((tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  return { ads, loading, error, pagination, activeTab, cardSearch, setCardSearch, page, changeTab, setPage, refetch: fetchAds };
}

export default useAds;
