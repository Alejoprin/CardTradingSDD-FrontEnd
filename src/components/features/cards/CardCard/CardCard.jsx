import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Placeholder from '../../../common/Placeholder/Placeholder';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import { RARITY_LABELS, RARITY_BADGE_VARIANTS, getImageUrl } from '../../../../utils/constants';
import styles from './CardCard.module.css';

function CardCard({ card, showOwner = false, onEdit, onDelete, onProposeTrade, onAddToInventory }) {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div
        className={styles.imageWrapper}
        onClick={() => navigate(`/cards/${card.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/cards/${card.id}`)}
        aria-label={`View details for ${card.name}`}
      >
        {card.imageUrl
          ? <img src={getImageUrl(card.imageUrl)} alt={card.name} className={styles.image} />
          : <Placeholder size="md" />
        }
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{card.name}</h3>
        <div className={styles.badges}>
          <Badge
            label={RARITY_LABELS[card.rarity] || card.rarity}
            variant={RARITY_BADGE_VARIANTS[card.rarity] || 'neutral'}
          />
        </div>
        {card.setName && <p className={styles.condition}>{card.setName}{card.gameName ? ` · ${card.gameName}` : ''}</p>}
        {card.condition && <p className={styles.condition}>{card.condition}</p>}
        {showOwner && card.username && (
          <p className={styles.owner}>by {card.username}</p>
        )}
      </div>
      <div className={styles.actions}>
        {onAddToInventory && <Button label="Add to Inventory" onClick={() => onAddToInventory(card)} />}
        {onProposeTrade && <Button label="Propose Trade" onClick={() => onProposeTrade(card)} variant="primary" />}
        {onEdit && <Button label="Edit" onClick={() => onEdit(card)} variant="secondary" />}
        {onDelete && <Button label="Delete" onClick={() => onDelete(card)} variant="danger" />}
      </div>
    </div>
  );
}

CardCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    rarity: PropTypes.string,
    imageUrl: PropTypes.string,
    setName: PropTypes.string,
    gameName: PropTypes.string,
    condition: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  showOwner: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onProposeTrade: PropTypes.func,
  onAddToInventory: PropTypes.func,
};

export default CardCard;
