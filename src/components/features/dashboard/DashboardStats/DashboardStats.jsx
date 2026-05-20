import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './DashboardStats.module.css';

const STAT_CONFIG = [
  {
    key: 'totalCards',
    label: 'Total Cards',
    icon: '🃏',
    accent: '#1E88E5',
    accentBg: '#E3F2FD',
  },
  {
    key: 'pendingTrades',
    label: 'Pending Trades',
    icon: '⏳',
    accent: '#FF9800',
    accentBg: '#FFF3E0',
  },
  {
    key: 'completedTrades',
    label: 'Completed Trades',
    icon: '✔',
    accent: '#4CAF50',
    accentBg: '#E8F5E9',
  },
];

function StatCard({ label, value, loading, icon, accent, accentBg }) {
  return (
    <div className={styles.statCard} style={{ '--accent': accent, '--accent-bg': accentBg }}>
      <div className={styles.iconBubble}>{icon}</div>
      <div className={styles.body}>
        <span className={styles.statLabel}>{label}</span>
        {loading
          ? <Spinner size="sm" />
          : <span className={styles.statValue}>{value ?? '—'}</span>
        }
      </div>
    </div>
  );
}

function DashboardStats({ stats, loading }) {
  return (
    <div className={styles.grid}>
      {STAT_CONFIG.map(({ key, label, icon, accent, accentBg }) => (
        <StatCard
          key={key}
          label={label}
          value={stats?.[key]}
          loading={loading}
          icon={icon}
          accent={accent}
          accentBg={accentBg}
        />
      ))}
    </div>
  );
}

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    totalCards: PropTypes.number,
    pendingTrades: PropTypes.number,
    completedTrades: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default DashboardStats;
