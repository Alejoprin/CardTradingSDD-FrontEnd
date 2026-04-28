import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import Placeholder from '../../../common/Placeholder/Placeholder';
import { TRADE_STATUS_LABELS, TRADE_STATUS_BADGE_VARIANTS } from '../../../../utils/constants';
import { formatDate, formatRelativeTime } from '../../../../utils/formatters';
import styles from './TradeDetail.module.css';

function CardMini({ card }) {
  return (
    <div className={styles.cardMini}>
      {card.imageUrl
        ? <img src={card.imageUrl} alt={card.name} className={styles.cardMiniImg} />
        : <Placeholder size="sm" />
      }
      <span className={styles.cardMiniName}>{card.name}</span>
    </div>
  );
}

function TradeDetail({ trade, currentUserId, onAccept, onReject, onCancel, readonly }) {
  const isInitiator = trade.initiatorId === currentUserId;
  const isRecipient = trade.counterpartyId === currentUserId;
  const isPending = trade.status === 'pending';

  return (
    <div className={styles.detail}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Trade #{trade.id.slice(-6)}</h1>
          <p className={styles.date}>Created {formatRelativeTime(trade.createdAt)}</p>
        </div>
        <Badge
          label={TRADE_STATUS_LABELS[trade.status] || trade.status}
          variant={TRADE_STATUS_BADGE_VARIANTS[trade.status] || 'neutral'}
        />
      </div>

      <div className={styles.parties}>
        <div className={styles.party}>
          <h3>Initiator</h3>
          <Link to={`/users/${trade.initiatorId}`}>{trade.initiatorUsername}</Link>
        </div>
        <span className={styles.arrow}>⇄</span>
        <div className={styles.party}>
          <h3>Counterparty</h3>
          <Link to={`/users/${trade.counterpartyId}`}>{trade.counterpartyUsername}</Link>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.col}>
          <h2 className={styles.colTitle}>
            {isInitiator ? 'You offer' : `${trade.initiatorUsername} offers`}
          </h2>
          <div className={styles.cardsList}>
            {(trade.offeredCards || []).map(card => <CardMini key={card.id} card={card} />)}
          </div>
        </div>
        <div className={styles.col}>
          <h2 className={styles.colTitle}>
            {isRecipient ? 'You receive' : `${trade.counterpartyUsername} offers`}
          </h2>
          <div className={styles.cardsList}>
            {(trade.requestedCards || []).map(card => <CardMini key={card.id} card={card} />)}
          </div>
        </div>
      </div>

      {trade.events && trade.events.length > 0 && (
        <div className={styles.timeline}>
          <h3 className={styles.timelineTitle}>Timeline</h3>
          {trade.events.map((ev, i) => (
            <div key={i} className={styles.event}>
              <span className={styles.eventTime}>{formatDate(ev.createdAt)}</span>
              <span className={styles.eventDesc}>{ev.description || ev.type}</span>
            </div>
          ))}
        </div>
      )}

      {!readonly && isPending && (
        <div className={styles.actions}>
          {isRecipient && onAccept && <Button label="Accept Trade" onClick={() => onAccept(trade)} />}
          {isRecipient && onReject && <Button label="Reject Trade" onClick={() => onReject(trade)} variant="secondary" />}
          {isInitiator && onCancel && <Button label="Cancel Trade" onClick={() => onCancel(trade)} variant="ghost" />}
        </div>
      )}
    </div>
  );
}

TradeDetail.propTypes = {
  trade: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    initiatorId: PropTypes.string,
    counterpartyId: PropTypes.string,
    initiatorUsername: PropTypes.string,
    counterpartyUsername: PropTypes.string,
    offeredCards: PropTypes.array,
    requestedCards: PropTypes.array,
    events: PropTypes.array,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
  readonly: PropTypes.bool,
};

TradeDetail.defaultProps = {
  readonly: false,
};

export default TradeDetail;
