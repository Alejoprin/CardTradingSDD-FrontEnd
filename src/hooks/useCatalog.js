import { useState, useEffect, useCallback } from 'react';
import cardService from '../services/cardService';
import useDebounce from './useDebounce';
import { parseApiError } from '../utils/errors';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

function useCatalog() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', rarity: '', setId: '', page: 1 });

  const debouncedSearch = useDebounce(filters.search);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page - 1,
        size: DEFAULT_PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.rarity ? { rarity: filters.rarity } : {}),
        ...(filters.setId ? { setId: filters.setId } : {}),
      };
      const data = await cardService.listCards(params);
      setCards(data.content || []);
      setPagination({ page: filters.page, totalPages: data.page?.totalPages || 1, total: data.page?.totalElements || 0 });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.rarity, filters.setId, filters.page]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return { cards, loading, error, pagination, filters, setFilter, setPage };
}

export default useCatalog;
