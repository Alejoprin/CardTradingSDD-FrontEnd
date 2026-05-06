import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './DashboardStats.module.css';

function StatCard({ label, value, loading }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      {loading
        ? <Spinner size="sm" />
        : <span className={styles.statValue}>{value ?? '—'}</span>
      }
    </div>
  );
}

function DashboardStats({ stats, loading }) {
  return (
    <div className={styles.grid}>
      <StatCard label="Total Cards" value={stats?.totalCards} loading={loading} />
      <StatCard label="Pending Trades" value={stats?.pendingTrades} loading={loading} />
      <StatCard label="Completed Trades" value={stats?.completedTrades} loading={loading} />
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
