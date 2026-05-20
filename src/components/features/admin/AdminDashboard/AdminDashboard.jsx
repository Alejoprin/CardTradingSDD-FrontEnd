import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <div className={styles.grid}>
      <KpiCard label={t('admin.totalUsers')} value={stats?.totalUsers} trend={stats?.trendUsers} loading={loading} />
      <KpiCard label={t('admin.totalCards')} value={stats?.totalCards} loading={loading} />
      <KpiCard label={t('admin.totalTrades')} value={stats?.totalTrades} trend={stats?.trendTrades} loading={loading} />
      <KpiCard label={t('admin.activeToday')} value={stats?.activeUsersToday} loading={loading} />
      <KpiCard label={t('admin.tradesToday')} value={stats?.tradesCompletedToday} loading={loading} />
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
