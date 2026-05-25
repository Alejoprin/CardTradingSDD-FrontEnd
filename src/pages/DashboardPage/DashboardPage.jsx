import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import useDashboard from '../../hooks/useDashboard';
import useInventory from '../../hooks/useInventory';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import DashboardStats from '../../components/features/dashboard/DashboardStats/DashboardStats';
import QuickActions from '../../components/features/dashboard/QuickActions/QuickActions';
import InventoryPreview from '../../components/features/dashboard/InventoryPreview/InventoryPreview';
import SetScroller from '../../components/features/dashboard/SetScroller/SetScroller';
import { ACTIVITY_EVENT_TYPES } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { stats, activities, loading, error } = useDashboard(user?.id);
  const { cards: inventoryCards, loading: inventoryLoading } = useInventory(user?.id);

  const ACTIVITY_LABELS = {
    [ACTIVITY_EVENT_TYPES.CARD_CREATED]: t('dashboard.activityAddedCard'),
    [ACTIVITY_EVENT_TYPES.CARD_UPDATED]: t('dashboard.activityUpdatedCard'),
    [ACTIVITY_EVENT_TYPES.CARD_DELETED]: t('dashboard.activityDeletedCard'),
    [ACTIVITY_EVENT_TYPES.TRADE_PROPOSED]: t('dashboard.activityProposedTrade'),
    [ACTIVITY_EVENT_TYPES.TRADE_ACCEPTED]: t('dashboard.activityAcceptedTrade'),
    [ACTIVITY_EVENT_TYPES.TRADE_REJECTED]: t('dashboard.activityRejectedTrade'),
    [ACTIVITY_EVENT_TYPES.TRADE_CANCELLED]: t('dashboard.activityCancelledTrade'),
    [ACTIVITY_EVENT_TYPES.PROFILE_UPDATED]: t('dashboard.activityUpdatedProfile'),
  };

  const ACTIVITY_ICONS = {
    [ACTIVITY_EVENT_TYPES.CARD_CREATED]: '➕',
    [ACTIVITY_EVENT_TYPES.CARD_UPDATED]: '✏️',
    [ACTIVITY_EVENT_TYPES.CARD_DELETED]: '🗑️',
    [ACTIVITY_EVENT_TYPES.TRADE_PROPOSED]: '📤',
    [ACTIVITY_EVENT_TYPES.TRADE_ACCEPTED]: '🤝',
    [ACTIVITY_EVENT_TYPES.TRADE_REJECTED]: '✖',
    [ACTIVITY_EVENT_TYPES.TRADE_CANCELLED]: '↩',
    [ACTIVITY_EVENT_TYPES.PROFILE_UPDATED]: '👤',
  };

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>

        <div className={styles.welcome}>
          <div className={styles.welcomeText}>
            <h1 className={styles.title}>
              {t('dashboard.welcomeBack')}, <span className={styles.username}>{user?.username}</span>!
            </h1>
            <p className={styles.subtitle}>{t('dashboard.hereIsHappening')}</p>
          </div>
          <SetScroller />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <DashboardStats stats={stats} loading={loading} />

        <InventoryPreview cards={inventoryCards} loading={inventoryLoading} />

        <div className={styles.lower}>
          <QuickActions />

          <div className={styles.feed}>
            <h2 className={styles.feedTitle}>{t('dashboard.recentActivity')}</h2>
            {loading ? (
              <p className={styles.feedEmpty}>{t('dashboard.loadingActivity')}</p>
            ) : activities.length === 0 ? (
              <p className={styles.feedEmpty}>{t('dashboard.noRecentActivity')}</p>
            ) : (
              <ul className={styles.feedList}>
                {activities.map((event, i) => (
                  <li key={i} className={styles.feedItem}>
                    <span className={styles.feedIcon}>
                      {ACTIVITY_ICONS[event.eventType] || '•'}
                    </span>
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
