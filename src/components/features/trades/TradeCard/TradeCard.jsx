import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import { TRADE_STATUS_LABELS, TRADE_STATUS_BADGE_VARIANTS } from '../../../../utils/constants';
import { formatRelativeTime } from '../../../../utils/formatters';
import styles from './TradeCard.module.css';

function TradeCard({ trade, currentUserId, onAccept, onReject, onCancel }) {
  const isInitiator = trade.initiatorId === currentUserId;
  const isRecipient = trade.counterpartyId === currentUserId;
  const counterpartUsername = isInitiator ? trade.counterpartyUsername : trade.initiatorUsername;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.counterpart}>
          Trade with <Link to={`/users/${isInitiator ? trade.counterpartyId : trade.initiatorId}`}>{counterpartUsername}</Link>
        </span>
        <Badge
          label={TRADE_STATUS_LABELS[trade.status] || trade.status}
          variant={TRADE_STATUS_BADGE_VARIANTS[trade.status] || 'neutral'}
        />
      </div>
      <div className={styles.summary}>
        <span className={styles.summaryItem}>
          You offer: <strong>{trade.offeredCards?.length ?? 0} card{trade.offeredCards?.length !== 1 ? 's' : ''}</strong>
        </span>
        <span className={styles.arrow}>⇄</span>
        <span className={styles.summaryItem}>
          You receive: <strong>{trade.requestedCards?.length ?? 0} card{trade.requestedCards?.length !== 1 ? 's' : ''}</strong>
        </span>
      </div>
      <div className={styles.footer}>
        <span className={styles.time}>{formatRelativeTime(trade.createdAt)}</span>
        <div className={styles.actions}>
          {trade.status === 'pending' && isRecipient && onAccept && (
            <Button label="Accept" onClick={() => onAccept(trade)} variant="primary" />
          )}
          {trade.status === 'pending' && isRecipient && onReject && (
            <Button label="Reject" onClick={() => onReject(trade)} variant="secondary" />
          )}
          {trade.status === 'pending' && isInitiator && onCancel && (
            <Button label="Cancel" onClick={() => onCancel(trade)} variant="ghost" />
          )}
          <Link to={`/trades/${trade.id}`} className={styles.detailLink}>View Details</Link>
        </div>
      </div>
    </div>
  );
}

TradeCard.propTypes = {
  trade: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    initiatorId: PropTypes.string,
    counterpartyId: PropTypes.string,
    initiatorUsername: PropTypes.string,
    counterpartyUsername: PropTypes.string,
    offeredCards: PropTypes.array,
    requestedCards: PropTypes.array,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
};

export default TradeCard;
