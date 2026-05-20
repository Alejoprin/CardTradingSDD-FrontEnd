import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTradeManagement from '../../../../hooks/useTradeManagement';
import TradeDetail from '../../trades/TradeDetail/TradeDetail';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import Input from '../../../common/Input/Input';
import Modal from '../../../common/Modal/Modal';
import Spinner from '../../../common/Spinner/Spinner';
import { TRADE_STATUS_BADGE_VARIANTS, TRADE_STATUSES } from '../../../../utils/constants';
import { formatDate } from '../../../../utils/formatters';
import styles from './TradeManagement.module.css';

TradeManagement.propTypes = {};

function TradeManagement() {
  const { t } = useTranslation();
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
          placeholder={t('trades.searchByUsername')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label={t('trades.status')}
        >
          <option value="">{t('trades.allStatuses')}</option>
          {TRADE_STATUSES.map(s => <option key={s} value={s}>{t(`tradeStatuses.${s.toLowerCase()}`)}</option>)}
        </select>
        <Input name="from" label={t('trades.fromDate')} type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} />
        <Input name="to" label={t('trades.toDate')} type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} />
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
                <th>{t('trades.initiator')}</th>
                <th>{t('trades.counterparty')}</th>
                <th>{t('trades.status')}</th>
                <th>{t('trades.offered')}</th>
                <th>{t('trades.requested')}</th>
                <th>{t('trades.createdDate')}</th>
                <th>{t('trades.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>{t('trades.noTrades')}</td></tr>
              ) : trades.map(trade => (
                <tr key={trade.id}>
                  <td className={styles.tradeId}>#{trade.id.slice(-6)}</td>
                  <td>{trade.initiatorUsername || trade.initiatorEmail}</td>
                  <td>{trade.counterpartyUsername || trade.counterpartyEmail}</td>
                  <td>
                    <Badge
                      label={t(`tradeStatuses.${trade.status.toLowerCase()}`) || trade.status}
                      variant={TRADE_STATUS_BADGE_VARIANTS[trade.status] || 'neutral'}
                    />
                  </td>
                  <td>{trade.offeredCards?.length ?? 0}</td>
                  <td>{trade.requestedCards?.length ?? 0}</td>
                  <td>{formatDate(trade.createdAt)}</td>
                  <td>
                    <Button label={t('trades.view')} onClick={() => setSelectedTrade(trade)} variant="secondary" />
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

      <Modal isOpen={!!selectedTrade} onClose={() => setSelectedTrade(null)} title={t('trades.tradeDetails')} size="lg">
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
