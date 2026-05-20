import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './DashboardStats.module.css';

function DashboardStats({ stats, loading }) {
  const { t } = useTranslation();

  const STAT_CONFIG = [
    {
      key: 'totalCards',
      label: t('dashboard.totalCards'),
      icon: '🃏',
      accent: '#1E88E5',
      accentBg: '#E3F2FD',
    },
    {
      key: 'pendingTrades',
      label: t('dashboard.pendingTrades'),
      icon: '⏳',
      accent: '#FF9800',
      accentBg: '#FFF3E0',
    },
    {
      key: 'completedTrades',
      label: t('dashboard.completedTrades'),
      icon: '✔',
      accent: '#4CAF50',
      accentBg: '#E8F5E9',
    },
  ];

  return (
    <div className={styles.grid}>
      {STAT_CONFIG.map(({ key, label, icon, accent, accentBg }) => (
        <div key={key} className={styles.statCard} style={{ '--accent': accent, '--accent-bg': accentBg }}>
          <div className={styles.iconBubble}>{icon}</div>
          <div className={styles.body}>
            <span className={styles.statLabel}>{label}</span>
            {loading
              ? <Spinner size="sm" />
              : <span className={styles.statValue}>{stats?.[key] ?? '—'}</span>
            }
          </div>
        </div>
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
