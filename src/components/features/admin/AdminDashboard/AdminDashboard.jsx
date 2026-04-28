import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './AdminDashboard.module.css';

function KpiCard({ label, value, trend, loading }) {
  const trendUp = trend > 0;
  return (
    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      {loading
        ? <Spinner size="sm" />
        : <span className={styles.kpiValue}>{value?.toLocaleString() ?? '—'}</span>
      }
      {trend != null && !loading && (
        <span className={`${styles.trend} ${trendUp ? styles.trendUp : styles.trendDown}`}>
          {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

function AdminDashboard({ stats, loading }) {
  return (
    <div className={styles.grid}>
      <KpiCard label="Total Users" value={stats?.totalUsers} trend={stats?.trendUsers} loading={loading} />
      <KpiCard label="Total Cards" value={stats?.totalCards} loading={loading} />
      <KpiCard label="Total Trades" value={stats?.totalTrades} trend={stats?.trendTrades} loading={loading} />
      <KpiCard label="Active Today" value={stats?.activeUsersToday} loading={loading} />
      <KpiCard label="Trades Today" value={stats?.tradesCompletedToday} loading={loading} />
    </div>
  );
}

AdminDashboard.propTypes = {
  stats: PropTypes.shape({
    totalUsers: PropTypes.number,
    totalCards: PropTypes.number,
    totalTrades: PropTypes.number,
    activeUsersToday: PropTypes.number,
    tradesCompletedToday: PropTypes.number,
    trendUsers: PropTypes.number,
    trendTrades: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

AdminDashboard.defaultProps = {
  loading: false,
};

export default AdminDashboard;
