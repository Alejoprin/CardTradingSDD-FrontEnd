import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import useDebounce from './useDebounce';
import { parseApiError } from '../utils/errors';
import { useNotification } from '../context/NotificationContext';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { addToast } = useNotification();

  const debouncedSearch = useDebounce(searchQuery);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.listUsers({ page: page - 1, size: DEFAULT_PAGE_SIZE });
      setUsers(data.content || []);
      setPagination({ page, totalPages: data.page?.totalPages || 1, total: data.page?.totalElements || 0 });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const ban = useCallback(async (userId, reason) => {
    try {
      const result = await adminService.banUser(userId, { banned: true, reason });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
      addToast('success', 'User banned successfully.');
      return result;
    } catch (err) {
      const appErr = parseApiError(err);
      addToast('error', appErr.message);
      throw appErr;
    }
  }, [addToast]);

  return {
    users, loading, error, pagination,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    page, setPage,
    ban,
    refetch: fetchUsers,
  };
}

export default useUserManagement;
