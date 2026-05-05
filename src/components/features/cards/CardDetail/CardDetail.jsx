import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Placeholder from '../../../common/Placeholder/Placeholder';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import { RARITY_LABELS, RARITY_BADGE_VARIANTS, getImageUrl } from '../../../../utils/constants';
import { formatDate } from '../../../../utils/formatters';
import styles from './CardDetail.module.css';

function CardDetail({ card, isOwn, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className={styles.detail}>
      <div className={styles.imageSection}>
        {card.imageUrl
          ? <img src={getImageUrl(card.imageUrl)} alt={card.name} className={styles.image} />
          : <Placeholder size="lg" />
        }
      </div>

      <div className={styles.infoSection}>
        <h1 className={styles.name}>{card.name}</h1>

        <div className={styles.badges}>
          <Badge
            label={RARITY_LABELS[card.rarity] || card.rarity}
            variant={RARITY_BADGE_VARIANTS[card.rarity] || 'neutral'}
          />
        </div>

        <dl className={styles.fields}>
          {card.gameName && <><dt>Game</dt><dd>{card.gameName}</dd></>}
          {card.setName && <><dt>Set</dt><dd>{card.setName}</dd></>}
          {card.cardNumber && <><dt>Number</dt><dd>{card.cardNumber}</dd></>}
          {card.marketPrice != null && <><dt>Market Price</dt><dd>${card.marketPrice.toFixed(2)}</dd></>}
          <dt>Added</dt><dd>{formatDate(card.createdAt)}</dd>
        </dl>

        <div className={styles.actions}>
          {isOwn && (
            <>
              <Button label="Edit" onClick={() => navigate(`/cards/${card.id}/edit`)} variant="secondary" />
              <Button label="Delete" onClick={onDelete} variant="danger" />
            </>
          )}
        </div>

        {card.tradeHistory && card.tradeHistory.length > 0 && (
          <div className={styles.history}>
            <h2 className={styles.historyTitle}>Trade History</h2>
            <ul className={styles.historyList}>
              {card.tradeHistory.map((item, i) => (
                <li key={i} className={styles.historyItem}>
                  <span>{formatDate(item.date)}</span>
                  <span>{item.description || `Traded with ${item.username}`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

CardDetail.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    rarity: PropTypes.string,
    gameName: PropTypes.string,
    setName: PropTypes.string,
    cardNumber: PropTypes.string,
    marketPrice: PropTypes.number,
    imageUrl: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  onDelete: PropTypes.func,
};

export default CardDetail;
