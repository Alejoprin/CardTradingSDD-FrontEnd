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
          <svg className={styles.polyOverlay} viewBox="0 0 1000 300" preserveAspectRatio="none">
            <polygon points="0,0 280,0 180,140 0,90" fill="#000000" opacity="0.04" />
            <polygon points="280,0 480,0 350,130" fill="#ffffff" opacity="0.05" />
            <polygon points="0,300 0,160 220,300" fill="#ffffff" opacity="0.04" />
            <polygon points="120,300 400,150 640,300" fill="#ffffff" opacity="0.06" />
            <polygon points="400,150 640,300 350,130" fill="#000000" opacity="0.02" />
            <polygon points="480,0 720,0 580,140 350,130" fill="#ffffff" opacity="0.03" />
            <polygon points="480,300 680,100 860,300" fill="#ffffff" opacity="0.05" />
            <polygon points="580,140 680,100 520,300" fill="#000000" opacity="0.02" />
            <polygon points="720,0 920,0 800,120 580,140" fill="#ffffff" opacity="0.04" />
            <polygon points="920,0 1000,0 1000,160 800,120" fill="#ffffff" opacity="0.06" />
          </svg>

          <div className={styles.welcomeText} style={{ position: 'relative', zIndex: 1 }}>
            <h1 className={styles.title}>
              {t('dashboard.welcomeBack')}, <span className={styles.username}>{user?.username}</span>!
            </h1>
            <p className={styles.subtitle}>{t('dashboard.hereIsHappening')}</p>
          </div>
          <SetScroller />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.statsWrapper}>
          <DashboardStats stats={stats} loading={loading} />
        </div>

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
