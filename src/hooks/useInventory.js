import { useState, useEffect, useCallback } from 'react';
import cardService from '../services/cardService';
import useDebounce from './useDebounce';
import { parseApiError } from '../utils/errors';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

function useInventory(userId) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', rarity: '', condition: '', page: 1 });

  const debouncedSearch = useDebounce(filters.search);

  const fetchInventory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        size: DEFAULT_PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.rarity ? { rarity: filters.rarity } : {}),
        ...(filters.condition ? { condition: filters.condition } : {}),
      };
      const data = await cardService.getUserInventory(userId, params);
      setCards(data.cards || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [userId, debouncedSearch, filters.rarity, filters.condition, filters.page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return { cards, loading, error, pagination, filters, setFilter, setPage, refetch: fetchInventory };
}

export default useInventory;
