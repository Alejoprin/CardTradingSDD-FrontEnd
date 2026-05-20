import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import Placeholder from '../../../common/Placeholder/Placeholder';
import { TRADE_STATUS_BADGE_VARIANTS } from '../../../../utils/constants';
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

function TradeDetail({ trade, currentUserId, onAccept, onReject, onCancel, readonly = false }) {
  const { t } = useTranslation();
  const isProposer = trade.proposerId === currentUserId;
  const isReceiver = trade.receiverId === currentUserId;
  const isPending = trade.status === 'PENDING';

  // Split items by who they come from
  const offeredCards = (trade.items || []).filter(i => i.fromUserId === trade.proposerId);
  const requestedCards = (trade.items || []).filter(i => i.fromUserId === trade.receiverId);

  return (
    <div className={styles.detail}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Trade #{trade.id.slice(-6)}</h1>
          <p className={styles.date}>{t('trades.created')} {formatRelativeTime(trade.createdAt)}</p>
        </div>
        <Badge
          label={t(`tradeStatuses.${trade.status.toLowerCase()}`) || trade.status}
          variant={TRADE_STATUS_BADGE_VARIANTS[trade.status] || 'neutral'}
        />
      </div>

      <div className={styles.parties}>
        <div className={styles.party}>
          <h3>{t('trades.proposer')}</h3>
          <Link to={`/users/${trade.proposerId}`}>{trade.proposerUsername}</Link>
        </div>
        <span className={styles.arrow}>⇄</span>
        <div className={styles.party}>
          <h3>{t('trades.receiver')}</h3>
          <Link to={`/users/${trade.receiverId}`}>{trade.receiverUsername}</Link>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.col}>
          <h2 className={styles.colTitle}>
            {isProposer ? t('trades.youOffer') : `${trade.proposerUsername} ${t('trades.offers')}`}
          </h2>
          <div className={styles.cardsList}>
            {offeredCards.map(card => <CardMini key={card.userCardId} card={{ ...card, name: card.cardName }} />)}
          </div>
        </div>
        <div className={styles.col}>
          <h2 className={styles.colTitle}>
            {isReceiver ? t('trades.youOffer') : `${trade.receiverUsername} ${t('trades.offers')}`}
          </h2>
          <div className={styles.cardsList}>
            {requestedCards.map(card => <CardMini key={card.userCardId} card={{ ...card, name: card.cardName }} />)}
          </div>
        </div>
      </div>

      {trade.events && trade.events.length > 0 && (
        <div className={styles.timeline}>
          <h3 className={styles.timelineTitle}>{t('trades.timeline')}</h3>
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
          {isReceiver && onAccept && <Button label={t('trades.acceptTrade')} onClick={() => onAccept(trade)} />}
          {isReceiver && onReject && <Button label={t('trades.rejectTrade')} onClick={() => onReject(trade)} variant="secondary" />}
          {isProposer && onCancel && <Button label={t('trades.cancelTrade')} onClick={() => onCancel(trade)} variant="ghost" />}
        </div>
      )}
    </div>
  );
}

TradeDetail.propTypes = {
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
  readonly: PropTypes.bool,
};

export default TradeDetail;
