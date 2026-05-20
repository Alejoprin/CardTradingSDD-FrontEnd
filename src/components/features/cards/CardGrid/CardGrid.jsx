import React from 'react';
import PropTypes from 'prop-types';
import CardCard from '../CardCard/CardCard';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './CardGrid.module.css';
function CardGrid({
  cards,
  loading = false,
  emptyMessage,
  showOwner = false,
  showQuantity = false,
  onEdit,
  onDelete,
  onProposeTrade,
  onAddToInventory,
  onUpdateQuantity,
}) {
  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" label="Loading cards..." />
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{emptyMessage || 'No cards found.'}</p>
      </div>
    );
  }
  return (
    <div className={styles.grid}>
      {cards.map(card => (
        <CardCard
          key={card.id}
          card={card}
          unowned={card.owned === false}
          showOwner={showOwner}
          showQuantity={showQuantity}
          onEdit={onEdit}
          onDelete={onDelete}
          onProposeTrade={onProposeTrade}
          onAddToInventory={onAddToInventory}
          onUpdateQuantity={onUpdateQuantity}
        />
      ))}
    </div>
  );
}
CardGrid.propTypes = {
  cards: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  showOwner: PropTypes.bool,
  showQuantity: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onProposeTrade: PropTypes.func,
  onAddToInventory: PropTypes.func,
  onUpdateQuantity: PropTypes.func,
};
export default CardGrid;