import React from 'react';
import { Link } from 'react-router-dom';
import styles from './InventoryPreview.module.css';

function InventoryPreview({ cards, loading }) {
  const preview = cards.slice(0, 3);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Inventory</h2>
        <Link to="/inventory" className={styles.viewAll}>View all →</Link>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading cards...</p>
      ) : preview.length === 0 ? (
        <p className={styles.empty}>No cards in your inventory yet.</p>
      ) : (
        <div className={styles.grid}>
          {preview.map(card => (
            <div key={card.userCardId} className={styles.card}>
              <div className={styles.imageWrapper}>
                {card.imageSmallUrl ? (
                  <img
                    src={card.imageSmallUrl}
                    alt={card.cardName}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>🃏</div>
                )}
              </div>
              <div className={styles.info}>
                <span className={styles.cardName}>{card.cardName}</span>
                <span className={styles.gameName}>{card.gameName}</span>
                {card.setName && (
                  <span className={styles.setName}>{card.setName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InventoryPreview;