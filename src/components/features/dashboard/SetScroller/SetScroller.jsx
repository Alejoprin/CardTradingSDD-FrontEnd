import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { getImageUrl } from '../../../../utils/constants';
import styles from './SetScroller.module.css';

function ScrollingColumn({ cards, direction }) {
  const doubled = [...cards, ...cards];
  const dirClass = direction === 'down' ? styles.scrollDown : styles.scrollUp;

  return (
    <div className={styles.column}>
      <div className={`${styles.track} ${dirClass}`}>
        {doubled.map((card, i) => (
          <div key={`${card.id || i}-${i}`} className={styles.card}>
            <div className={styles.cardImage}>
              {card.imageSmallUrl || card.imageUrl ? (
                <img src={getImageUrl(card.imageSmallUrl || card.imageUrl)} alt={card.name} />
              ) : (
                <div className={styles.cardFallback}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>
            <span className={styles.cardName}>{card.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetScroller() {
  const [columns, setColumns] = useState([[], [], []]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchColumnData() {
      try {
        const gamesRes = await api.get('/cards/games');
        const games = gamesRes.data || [];

        if (games.length === 0) {
          if (!cancelled) setLoading(false);
          return;
        }

        const result = await Promise.all(
          games.slice(0, 4).map(async (game) => {
            try {
              const setsRes = await api.get('/cards/sets', { params: { gameId: game.id } });
              const sets = setsRes.data || [];

              for (const set of sets) {
                const cardsRes = await api.get('/cards', { params: { setId: set.id, size: 12 } });
                const cards = (cardsRes.data?.content || cardsRes.data || []).map(c => ({
                  id: c.id || c.cardId,
                  name: c.name || c.cardName,
                  imageSmallUrl: c.imageSmallUrl,
                  imageUrl: c.imageUrl,
                }));
                if (cards.length > 0) return cards;
              }
            } catch {
              // Skip game if sets fail
            }
            return [];
          })
        );

        const filled = result.filter(arr => arr.length > 0).slice(0, 3);
        while (filled.length < 3) filled.push([]);

        if (!cancelled) {
          setColumns(filled);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    fetchColumnData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className={styles.grid}>
        {[0, 1, 2].map(i => (
          <div key={i} className={styles.column}>
            <div className={styles.track}>
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonName} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (columns.every(col => col.length === 0)) return null;

  return (
    <div className={styles.grid}>
      <ScrollingColumn cards={columns[0]} direction="up" />
      <ScrollingColumn cards={columns[1]} direction="down" />
      <ScrollingColumn cards={columns[2]} direction="up" />
    </div>
  );
}

export default SetScroller;
