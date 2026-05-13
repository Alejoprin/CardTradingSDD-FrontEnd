import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useDashboard from '../../hooks/useDashboard';
import useInventory from '../../hooks/useInventory';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import DashboardStats from '../../components/features/dashboard/DashboardStats/DashboardStats';
import QuickActions from '../../components/features/dashboard/QuickActions/QuickActions';
import InventoryPreview from '../../components/features/dashboard/InventoryPreview/InventoryPreview';
import { ACTIVITY_EVENT_TYPES } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';
import styles from './DashboardPage.module.css';

const ACTIVITY_LABELS = {
  [ACTIVITY_EVENT_TYPES.CARD_CREATED]: 'Added a card',
  [ACTIVITY_EVENT_TYPES.CARD_UPDATED]: 'Updated a card',
  [ACTIVITY_EVENT_TYPES.CARD_DELETED]: 'Deleted a card',
  [ACTIVITY_EVENT_TYPES.TRADE_PROPOSED]: 'Proposed a trade',
  [ACTIVITY_EVENT_TYPES.TRADE_ACCEPTED]: 'Accepted a trade',
  [ACTIVITY_EVENT_TYPES.TRADE_REJECTED]: 'Rejected a trade',
  [ACTIVITY_EVENT_TYPES.TRADE_CANCELLED]: 'Cancelled a trade',
  [ACTIVITY_EVENT_TYPES.PROFILE_UPDATED]: 'Updated profile',
};

function DashboardPage() {
  const { user, logout } = useAuth();
  const { stats, activities, loading, error } = useDashboard(user?.id);
  const { cards: inventoryCards, loading: inventoryLoading } = useInventory(user?.id);

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.welcome}>
          <h1 className={styles.title}>Welcome back, {user?.username}!</h1>
          <p className={styles.subtitle}>Here's what's happening in your collection.</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <DashboardStats stats={stats} loading={loading} />

        <div className={styles.lower}>
          <QuickActions />

          <InventoryPreview cards={inventoryCards} loading={inventoryLoading} />

          <div className={styles.feed}>
            <h2 className={styles.feedTitle}>Recent Activity</h2>
            {loading ? (
              <p className={styles.feedEmpty}>Loading activity...</p>
            ) : activities.length === 0 ? (
              <p className={styles.feedEmpty}>No recent activity.</p>
            ) : (
              <ul className={styles.feedList}>
                {activities.map((event, i) => (
                  <li key={i} className={styles.feedItem}>
                    <span className={styles.feedEvent}>
                      {ACTIVITY_LABELS[event.eventType] || event.eventType}
                      {event.entityName ? `: ${event.entityName}` : ''}
                    </span>
                    <span className={styles.feedTime}>{formatRelativeTime(event.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default DashboardPage;