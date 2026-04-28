import React, { useState } from 'react';
import useUserManagement from '../../../../hooks/useUserManagement';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import Input from '../../../common/Input/Input';
import Modal from '../../../common/Modal/Modal';
import Spinner from '../../../common/Spinner/Spinner';
import { formatDate } from '../../../../utils/formatters';
import styles from './UserManagement.module.css';

UserManagement.propTypes = {};

function UserManagement() {
  const {
    users, loading, error, pagination,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    page, setPage,
    ban,
  } = useUserManagement();

  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  async function handleBan() {
    if (!banTarget) return;
    setBanning(true);
    try {
      await ban(banTarget.id, banReason || 'Violation of trading rules');
      setBanTarget(null);
      setBanReason('');
    } catch {
      // Toast shown by hook
    } finally {
      setBanning(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <Input
          name="search"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.center}><Spinner size="lg" /></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Cards</th>
                <th>Trades</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>No users found.</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td><Badge label={u.status} variant={u.status === 'active' ? 'success' : 'error'} /></td>
                  <td><Badge label={u.role} variant={u.role === 'admin' ? 'info' : 'neutral'} /></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>{u.stats?.totalCards ?? 0}</td>
                  <td>{u.stats?.completedTrades ?? 0}</td>
                  <td>
                    {u.status !== 'banned' && (
                      <Button label="Ban" onClick={() => setBanTarget(u)} variant="danger" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button label="Previous" onClick={() => setPage(page - 1)} disabled={page <= 1} variant="secondary" />
          <span>Page {page} of {pagination.totalPages}</span>
          <Button label="Next" onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages} variant="secondary" />
        </div>
      )}

      <Modal isOpen={!!banTarget} onClose={() => setBanTarget(null)} title="Ban User">
        <p>Ban <strong>{banTarget?.username}</strong>? All pending trades will be cancelled.</p>
        <div className={styles.reasonField}>
          <Input
            name="banReason"
            label="Reason (optional)"
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            placeholder="Violation of trading rules"
          />
        </div>
        <div className={styles.modalActions}>
          <Button label="Cancel" onClick={() => setBanTarget(null)} variant="secondary" />
          <Button label="Ban User" onClick={handleBan} variant="danger" isLoading={banning} />
        </div>
      </Modal>
    </div>
  );
}

export default UserManagement;
