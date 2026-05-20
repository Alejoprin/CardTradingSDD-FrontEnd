import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import useAdminStats from '../../hooks/useAdminStats';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import AdminDashboard from '../../components/features/admin/AdminDashboard/AdminDashboard';
import UserManagement from '../../components/features/admin/UserManagement/UserManagement';
import TradeManagement from '../../components/features/admin/TradeManagement/TradeManagement';
import StatsView from '../../components/features/admin/StatsView/StatsView';
import styles from './AdminPage.module.css';

const TABS = [
  { key: 'dashboard', labelKey: 'admin.tabDashboard' },
  { key: 'users', labelKey: 'admin.tabUsers' },
  { key: 'trades', labelKey: 'admin.tabTrades' },
  { key: 'statistics', labelKey: 'admin.tabStatistics' },
];

function AdminPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [period, setPeriod] = useState('7d');
  const { stats, loading } = useAdminStats(period);

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.panelTitle')}</h1>
        </div>

        <div className={styles.tabs} role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <div className={styles.content} role="tabpanel">
          {activeTab === 'dashboard' && (
            <AdminDashboard stats={stats} loading={loading} />
          )}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'trades' && <TradeManagement />}
          {activeTab === 'statistics' && (
            <StatsView stats={stats} period={period} onPeriodChange={setPeriod} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminPage;
