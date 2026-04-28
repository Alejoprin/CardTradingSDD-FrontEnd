import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProfileStats.module.css';

function StatItem({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.value}>{value ?? '—'}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

function ProfileStats({ stats }) {
  return (
    <div className={styles.wrapper}>
      <StatItem label="Total Cards" value={stats.totalCards} />
      <StatItem label="Completed Trades" value={stats.completedTrades} />
      <StatItem label="Pending Trades" value={stats.pendingTrades} />
      <StatItem label="Rating" value={stats.rating != null ? stats.rating.toFixed(1) : null} />
    </div>
  );
}

ProfileStats.propTypes = {
  stats: PropTypes.shape({
    totalCards: PropTypes.number,
    completedTrades: PropTypes.number,
    pendingTrades: PropTypes.number,
    rating: PropTypes.number,
  }).isRequired,
};

export default ProfileStats;
