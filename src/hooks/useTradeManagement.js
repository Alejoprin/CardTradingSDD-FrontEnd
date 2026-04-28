import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import useDebounce from './useDebounce';
import { parseApiError } from '../utils/errors';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

function useTradeManagement() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: DEFAULT_PAGE_SIZE,
        ...(debouncedSearch ? { username: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(dateRange.from ? { from: dateRange.from } : {}),
        ...(dateRange.to ? { to: dateRange.to } : {}),
      };
      const data = await adminService.listAllTrades(params);
      setTrades(data.trades || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, dateRange, page]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return {
    trades, loading, error, pagination,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    page, setPage,
    refetch: fetchTrades,
  };
}

export default useTradeManagement;
