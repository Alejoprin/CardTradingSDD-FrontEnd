import { useState, useEffect, useCallback } from 'react';
import tradeService from '../services/tradeService';
import { parseApiError } from '../utils/errors';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

function useTradesList() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState('PENDING');
  const [page, setPage] = useState(1);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: page - 1, size: DEFAULT_PAGE_SIZE, status: activeTab };
      const data = await tradeService.listTrades(params);
      setTrades(data.content || []);
      setPagination({ page, totalPages: data.page?.totalPages || 1, total: data.page?.totalElements || 0 });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const changeTab = useCallback((tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  return { trades, loading, error, pagination, activeTab, page, changeTab, setPage, refetch: fetchTrades };
}

export default useTradesList;
