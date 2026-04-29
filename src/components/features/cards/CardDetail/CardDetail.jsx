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
          {card.cardType && <><dt>Type</dt><dd>{card.cardType}</dd></>}
          {card.edition && <><dt>Edition</dt><dd>{card.edition}</dd></>}
          {card.description && <><dt>Description</dt><dd>{card.description}</dd></>}
          <dt>Added</dt><dd>{formatDate(card.createdAt)}</dd>
        </dl>

        <div className={styles.actions}>
          {isOwn ? (
            <>
              <Button label="Edit" onClick={() => navigate(`/cards/${card.id}/edit`)} variant="secondary" />
              <Button label="Delete" onClick={onDelete} variant="danger" />
            </>
          ) : (
            <Button
              label="Propose Trade"
              onClick={() => navigate(`/trades/create?targetUserId=${card.userId}&cardId=${card.id}`)}
            />
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
    series: PropTypes.string,
    number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rarity: PropTypes.string,
    condition: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    userId: PropTypes.string,
    username: PropTypes.string,
    createdAt: PropTypes.string,
    tradeHistory: PropTypes.array,
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  onDelete: PropTypes.func,
};

export default CardDetail;
