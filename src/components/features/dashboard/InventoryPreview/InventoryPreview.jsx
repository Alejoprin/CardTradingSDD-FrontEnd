import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './InventoryPreview.module.css';

function InventoryPreview({ cards, loading }) {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = useMemo(
    () => [...new Set(cards.map(c => c.gameName).filter(Boolean))],
    [cards]
  );

  useEffect(() => {
    if (games.length > 0 && (selectedGame === null || !games.includes(selectedGame))) {
      setSelectedGame(games[0]);
    }
  }, [games, selectedGame]);

  const setGroups = useMemo(() => {
    if (!selectedGame) return {};
    const filtered = cards.filter(c => c.gameName === selectedGame);
    const groups = {};
    filtered.forEach(card => {
      const key = card.setName || 'Unknown Set';
      if (!groups[key]) {
        groups[key] = { cards: [], setTotal: card.setTotalCards ?? null };
      }
      groups[key].cards.push(card);
    });
    return groups;
  }, [cards, selectedGame]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Inventory</h2>
        <Link to="/inventory" className={styles.viewAll}>View all →</Link>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading cards...</p>
      ) : cards.length === 0 ? (
        <p className={styles.empty}>No cards in your inventory yet.</p>
      ) : (
        <>
          <div className={styles.gamePills}>
            {games.map(game => (
              <button
                key={game}
                className={`${styles.pill} ${selectedGame === game ? styles.pillActive : ''}`}
                onClick={() => setSelectedGame(game)}
              >
                {game}
              </button>
            ))}
          </div>

          <div className={styles.setList}>
            {Object.entries(setGroups).map(([setName, { cards: setCards, setTotal }]) => (
              <div key={setName} className={styles.setSection}>
                <div className={styles.setHeader}>
                  <span className={styles.setName}>{setName}</span>
                  <span className={styles.setCount}>
                    {setCards.length}
                    {setTotal !== null ? `/${setTotal}` : ''} cards
                  </span>
                </div>
                <div className={styles.cardStrip}>
                  {setCards.map(card => (
                    <div key={card.userCardId} className={styles.cardThumb} title={card.cardName}>
                      {card.imageSmallUrl ? (
                        <img
                          src={card.imageSmallUrl}
                          alt={card.cardName}
                          className={styles.thumbImg}
                        />
                      ) : (
                        <div className={styles.thumbPlaceholder}>🃏</div>
                      )}
                      {card.quantity > 1 && (
                        <span className={styles.quantityBadge}>×{card.quantity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default InventoryPreview;
