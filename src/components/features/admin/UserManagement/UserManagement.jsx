import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          placeholder={t('admin.searchUsers')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label={t('admin.status')}
        >
          <option value="">{t('admin.allStatuses') || t('trades.allStatuses')}</option>
          <option value="active">{t('admin.active')}</option>
          <option value="banned">{t('admin.banned')}</option>
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
                <th>{t('auth.username')}</th>
                <th>{t('admin.email')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.role')}</th>
                <th>{t('admin.joined')}</th>
                <th>{t('dashboard.totalCards')}</th>
                <th>{t('dashboard.completedTrades')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>{t('admin.noUsersFound')}</td></tr>
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
                      <Button label={t('admin.ban')} onClick={() => setBanTarget(u)} variant="danger" />
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
          <Button label={t('common.previous')} onClick={() => setPage(page - 1)} disabled={page <= 1} variant="secondary" />
          <span>{t('common.page')} {page} {t('common.of')} {pagination.totalPages}</span>
          <Button label={t('common.next')} onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages} variant="secondary" />
        </div>
      )}

      <Modal isOpen={!!banTarget} onClose={() => setBanTarget(null)} title={t('admin.banUser')}>
        <p>{t('admin.banUserConfirm', { username: banTarget?.username })}</p>
        <div className={styles.reasonField}>
          <Input
            name="banReason"
            label={t('admin.banReason')}
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            placeholder={t('admin.banReasonPlaceholder')}
          />
        </div>
        <div className={styles.modalActions}>
          <Button label={t('common.cancel')} onClick={() => setBanTarget(null)} variant="secondary" />
          <Button label={t('admin.banUserAction')} onClick={handleBan} variant="danger" isLoading={banning} />
        </div>
      </Modal>
    </div>
  );
}

export default UserManagement;
