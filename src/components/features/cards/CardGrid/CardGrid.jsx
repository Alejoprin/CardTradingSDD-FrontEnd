import React from 'react';
import PropTypes from 'prop-types';
import CardCard from '../CardCard/CardCard';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './CardGrid.module.css';

function CardGrid({ cards, loading, emptyMessage, isOwn, showOwner, onEdit, onDelete, onProposeTrade }) {
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
          isOwn={isOwn}
          showOwner={showOwner}
          onEdit={onEdit}
          onDelete={onDelete}
          onProposeTrade={onProposeTrade}
        />
      ))}
    </div>
  );
}

CardGrid.propTypes = {
  cards: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  isOwn: PropTypes.bool,
  showOwner: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onProposeTrade: PropTypes.func,
};

CardGrid.defaultProps = {
  loading: false,
  isOwn: false,
  showOwner: false,
};

export default CardGrid;
