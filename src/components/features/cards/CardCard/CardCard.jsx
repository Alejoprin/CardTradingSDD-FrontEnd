import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Placeholder from '../../../common/Placeholder/Placeholder';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import { RARITY_LABELS, RARITY_BADGE_VARIANTS, getImageUrl } from '../../../../utils/constants';
import styles from './CardCard.module.css';

function CardCard({ card, showOwner = false, showQuantity = false,
  onEdit, onDelete, onProposeTrade, onAddToInventory, onUpdateQuantity }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(card.quantity || 1);
  const [qtyLoading, setQtyLoading] = useState(false);

  async function handleQtyChange(newQty) {
    if (newQty < 1 || newQty > 99 || !onUpdateQuantity) return;
    setQtyLoading(true);
    try {
      await onUpdateQuantity(card, newQty);
      setQty(newQty);
    } finally {
      setQtyLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div
        className={styles.imageWrapper}
        onClick={() => navigate(`/cards/${card.cardId || card.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/cards/${card.cardId || card.id}`)}
        aria-label={`View details for ${card.name}`}
      >
        {(card.imageSmallUrl || card.imageUrl)
          ? <img src={getImageUrl(card.imageSmallUrl || card.imageUrl)} alt={card.name} className={styles.image} />
          : <Placeholder size="md" />
        }
        {/* Badge de cantidad encima de la imagen */}
        {showQuantity && (
          <span className={styles.quantityBadge}>{qty}</span>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{card.name}</h3>
        <div className={styles.badges}>
          <Badge
            label={RARITY_LABELS[card.rarity] || card.rarity}
            variant={RARITY_BADGE_VARIANTS[card.rarity] || 'neutral'}
          />
        </div>
        {card.setName && (
          <p className={styles.condition}>{card.setName}{card.gameName ? ` · ${card.gameName}` : ''}</p>
        )}
        {card.condition && <p className={styles.condition}>{card.condition}</p>}
        {showOwner && card.username && (
          <p className={styles.owner}>by {card.username}</p>
        )}
      </div>

      <div className={styles.actions}>
        {/* Controles de cantidad */}
        {showQuantity && onUpdateQuantity && (
          <div className={styles.qtyControls}>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(qty - 1)}
              disabled={qty <= 1 || qtyLoading}
              aria-label="Decrease quantity"
            >−</button>
            <span className={styles.qtyValue}>{qty}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQtyChange(qty + 1)}
              disabled={qty >= 99 || qtyLoading}
              aria-label="Increase quantity"
            >+</button>
          </div>
        )}

        {onAddToInventory && (
          <Button label="Add to Inventory" onClick={() => onAddToInventory(card)} />
        )}
        {onProposeTrade && (
          <Button label="Propose Trade" onClick={() => onProposeTrade(card)} variant="primary" />
        )}
        {onEdit && (
          <Button label="Edit" onClick={() => onEdit(card)} variant="secondary" />
        )}
        {onDelete && (
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(card)}
            aria-label={`Delete ${card.name}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
        )}
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
    imageSmallUrl: PropTypes.string,
    setName: PropTypes.string,
    gameName: PropTypes.string,
    condition: PropTypes.string,
    username: PropTypes.string,
    quantity: PropTypes.number,
  }).isRequired,
  showOwner: PropTypes.bool,
  showQuantity: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onProposeTrade: PropTypes.func,
  onAddToInventory: PropTypes.func,
  onUpdateQuantity: PropTypes.func,
};

export default CardCard;