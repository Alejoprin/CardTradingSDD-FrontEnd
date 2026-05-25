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
    },
    {
      key: 'pendingTrades',
      label: t('dashboard.pendingTrades'),
      icon: '⏳',
    },
    {
      key: 'completedTrades',
      label: t('dashboard.completedTrades'),
      icon: '✔',
    },
  ];

  return (
    <div className={styles.grid}>
      {STAT_CONFIG.map(({ key, label, icon }) => (
        <div key={key} className={styles.statCard}>
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
