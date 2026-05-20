import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <div className={styles.wrapper}>
      <StatItem label={t('dashboard.totalCards')} value={stats.totalCards} />
      <StatItem label={t('dashboard.completedTrades')} value={stats.completedTrades} />
      <StatItem label={t('dashboard.pendingTrades')} value={stats.pendingTrades} />
      <StatItem label={t('profile.rating')} value={stats.rating != null ? stats.rating.toFixed(1) : null} />
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
