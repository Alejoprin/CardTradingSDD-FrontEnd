import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import { TRADE_STATUS_BADGE_VARIANTS } from '../../../../utils/constants';
import { formatRelativeTime } from '../../../../utils/formatters';
import styles from './TradeCard.module.css';

function TradeCard({ trade, currentUserId, onAccept, onReject, onCancel }) {
  const { t } = useTranslation();
  const isProposer = trade.proposerId === currentUserId;
  const isReceiver = trade.receiverId === currentUserId;
  const counterpartUsername = isProposer ? trade.receiverUsername : trade.proposerUsername;
  const counterpartId = isProposer ? trade.receiverId : trade.proposerId;

  const offeredCount = (trade.items || []).filter(i => i.fromUserId === trade.proposerId).length;
  const requestedCount = (trade.items || []).filter(i => i.fromUserId === trade.receiverId).length;

  const isPending = trade.status === 'PENDING';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.counterpart}>
          {t('trades.tradeWith')} <Link to={`/users/${counterpartId}`}>{counterpartUsername}</Link>
        </span>
        <Badge
          label={t(`tradeStatuses.${trade.status.toLowerCase()}`) || trade.status}
          variant={TRADE_STATUS_BADGE_VARIANTS[trade.status] || 'neutral'}
        />
      </div>
      <div className={styles.summary}>
        <span className={styles.summaryItem}>
          {t('trades.youOffer')}: <strong>{offeredCount} {offeredCount !== 1 ? t('common.cards') : t('common.cards')}</strong>
        </span>
        <span className={styles.arrow}>⇄</span>
        <span className={styles.summaryItem}>
          {t('trades.youReceive')}: <strong>{requestedCount} {requestedCount !== 1 ? t('common.cards') : t('common.cards')}</strong>
        </span>
      </div>
      <div className={styles.footer}>
        <span className={styles.time}>{formatRelativeTime(trade.createdAt)}</span>
        <div className={styles.actions}>
          {isPending && isReceiver && onAccept && (
            <Button label={t('trades.accept')} onClick={() => onAccept(trade)} variant="primary" />
          )}
          {isPending && isReceiver && onReject && (
            <Button label={t('trades.reject')} onClick={() => onReject(trade)} variant="secondary" />
          )}
          {isPending && isProposer && onCancel && (
            <Button label={t('trades.cancel')} onClick={() => onCancel(trade)} variant="ghost" />
          )}
          <Link to={`/trades/${trade.id}`} className={styles.detailLink}>{t('trades.viewDetails')}</Link>
        </div>
      </div>
    </div>
  );
}

TradeCard.propTypes = {
  trade: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    proposerId: PropTypes.string,
    receiverId: PropTypes.string,
    proposerUsername: PropTypes.string,
    receiverUsername: PropTypes.string,
    items: PropTypes.array,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
};

export default TradeCard;
