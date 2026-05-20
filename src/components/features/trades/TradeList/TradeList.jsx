import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TradeCard from '../TradeCard/TradeCard';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './TradeList.module.css';

function TradeList({ trades, activeTab, onTabChange, currentUserId, loading, onAccept, onReject, onCancel }) {
  const { t } = useTranslation();

  const TABS = [
    { key: 'PENDING', label: t('trades.pending') },
    { key: 'COMPLETED', label: t('trades.completed') },
    { key: 'REJECTED', label: t('trades.rejected') },
    { key: 'CANCELLED', label: t('trades.cancelled') },
  ];

  const EMPTY_MESSAGES = {
    PENDING: t('trades.noPendingTrades'),
    COMPLETED: t('trades.noCompletedTrades'),
    REJECTED: t('trades.noRejectedTrades'),
    CANCELLED: t('trades.noCancelledTrades'),
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {loading ? (
          <div className={styles.center}><Spinner size="lg" /></div>
        ) : trades.length === 0 ? (
          <p className={styles.empty}>{EMPTY_MESSAGES[activeTab] || t('trades.noTradesFound')}</p>
        ) : (
          <div className={styles.list}>
            {trades.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                currentUserId={currentUserId}
                onAccept={onAccept}
                onReject={onReject}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

TradeList.propTypes = {
  trades: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  currentUserId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
};

TradeList.defaultProps = {
  loading: false,
};

export default TradeList;
