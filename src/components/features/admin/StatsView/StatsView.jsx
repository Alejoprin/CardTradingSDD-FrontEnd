import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Button from '../../../common/Button/Button';
import { ADMIN_STATS_PERIODS } from '../../../../utils/constants';
import styles from './StatsView.module.css';

const RARITY_COLORS = ['#9E9E9E', '#1E88E5', '#FF9800', '#4CAF50'];

function StatsView({ stats, period, onPeriodChange }) {
  const { t } = useTranslation();
  function handleExportCSV() {
    if (!stats) return;

    const rows = [
      ['Metric', 'Value'],
      [t('admin.totalUsers'), stats.totalUsers],
      [t('admin.totalCards'), stats.totalCards],
      [t('admin.totalTrades'), stats.totalTrades],
      [t('admin.activeToday'), stats.activeUsersToday],
      [t('admin.tradesToday'), stats.tradesCompletedToday],
      [],
      ['Date', 'New Users'],
      ...(stats.usersByPeriod || []).map(r => [r.date, r.count]),
      [],
      ['Rarity', 'Count'],
      ...(stats.cardsByRarity || []).map(r => [r.rarity, r.count]),
      [],
      ['Status', 'Count'],
      ...(stats.tradesByStatus || []).map(r => [r.status, r.count]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-stats-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.periods}>
          {ADMIN_STATS_PERIODS.map(p => (
            <button
              key={p}
              className={`${styles.periodBtn} ${period === p ? styles.activePeriod : ''}`}
              onClick={() => onPeriodChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <Button label={t('admin.exportCSV')} onClick={handleExportCSV} variant="secondary" />
      </div>

      <div className={styles.charts}>
        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>{t('admin.newUsersByPeriod')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.usersByPeriod || []}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1E88E5" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>{t('admin.cardsByRarity')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats?.cardsByRarity || []}
                dataKey="count"
                nameKey="rarity"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ rarity, percent }) => `${rarity} ${(percent * 100).toFixed(0)}%`}
              >
                {(stats?.cardsByRarity || []).map((_, i) => (
                  <Cell key={i} fill={RARITY_COLORS[i % RARITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>{t('admin.tradesByStatus')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.tradesByStatus || []}>
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#757575" name="Trades" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartBox}>
          <h3 className={styles.chartTitle}>{t('admin.acceptanceRejectionRates')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.tradeRates || []}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accepted" stroke="#4CAF50" name="Accepted" dot={false} />
              <Line type="monotone" dataKey="rejected" stroke="#F44336" name="Rejected" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

StatsView.propTypes = {
  stats: PropTypes.object,
  period: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
};

export default StatsView;
