import React, { useState } from 'react';
import useTradeManagement from '../../../../hooks/useTradeManagement';
import TradeDetail from '../../trades/TradeDetail/TradeDetail';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import Input from '../../../common/Input/Input';
import Modal from '../../../common/Modal/Modal';
import Spinner from '../../../common/Spinner/Spinner';
import { TRADE_STATUS_BADGE_VARIANTS, TRADE_STATUS_LABELS, TRADE_STATUSES } from '../../../../utils/constants';
import { formatDate } from '../../../../utils/formatters';
import styles from './TradeManagement.module.css';

TradeManagement.propTypes = {};

function TradeManagement() {
  const {
    trades, loading, error, pagination,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateRange, setDateRange,
    page, setPage,
  } = useTradeManagement();

  const [selectedTrade, setSelectedTrade] = useState(null);

  // Admin view uses a placeholder currentUserId — no action buttons shown (readonly=true)
  const ADMIN_PLACEHOLDER_ID = '__admin__';

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <Input
          name="search"
          placeholder="Search by username..."
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
          {TRADE_STATUSES.map(s => <option key={s} value={s}>{TRADE_STATUS_LABELS[s]}</option>)}
        </select>
        <Input name="from" label="From date" type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} />
        <Input name="to" label="To date" type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.center}><Spinner size="lg" /></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Initiator</th>
                <th>Counterparty</th>
                <th>Status</th>
                <th>Offered</th>
                <th>Requested</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>No trades found.</td></tr>
              ) : trades.map(trade => (
                <tr key={trade.id}>
                  <td className={styles.tradeId}>#{trade.id.slice(-6)}</td>
                  <td>{trade.initiatorUsername || trade.initiatorEmail}</td>
                  <td>{trade.counterpartyUsername || trade.counterpartyEmail}</td>
                  <td>
                    <Badge
                      label={TRADE_STATUS_LABELS[trade.status] || trade.status}
                      variant={TRADE_STATUS_BADGE_VARIANTS[trade.status] || 'neutral'}
                    />
                  </td>
                  <td>{trade.offeredCards?.length ?? 0}</td>
                  <td>{trade.requestedCards?.length ?? 0}</td>
                  <td>{formatDate(trade.createdAt)}</td>
                  <td>
                    <Button label="View" onClick={() => setSelectedTrade(trade)} variant="secondary" />
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

      <Modal isOpen={!!selectedTrade} onClose={() => setSelectedTrade(null)} title="Trade Details" size="lg">
        {selectedTrade && (
          <TradeDetail
            trade={selectedTrade}
            currentUserId={ADMIN_PLACEHOLDER_ID}
            readonly={true}
          />
        )}
      </Modal>
    </div>
  );
}

export default TradeManagement;
