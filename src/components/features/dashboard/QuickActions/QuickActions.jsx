import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import styles from './QuickActions.module.css';

function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const baseActions = [
    {
      icon: '🔍',
      label: t('dashboard.exploreCatalog'),
      description: t('dashboard.browseCards'),
      path: '/catalog',
      accent: '#1E88E5',
      accentBg: '#E3F2FD',
    },
    {
      icon: '🔄',
      label: t('dashboard.myTrades'),
      description: t('dashboard.checkManageTrades'),
      path: '/trades',
      accent: '#4CAF50',
      accentBg: '#E8F5E9',
    },
  ];

  const adminAction = {
    icon: '➕',
    label: t('dashboard.addCard'),
    description: t('dashboard.createNewCard'),
    path: '/cards/create',
    accent: '#FF9800',
    accentBg: '#FFF3E0',
  };

  const actions = isAdmin ? [adminAction, ...baseActions] : baseActions;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('dashboard.quickActions')}</h2>
      <div className={styles.list}>
        {actions.map(action => (
          <button
            key={action.path}
            className={styles.tile}
            onClick={() => navigate(action.path)}
            style={{ '--tile-accent': action.accent, '--tile-accent-bg': action.accentBg }}
          >
            <div className={styles.iconBubble}>{action.icon}</div>
            <div className={styles.tileContent}>
              <span className={styles.tileLabel}>{action.label}</span>
              <span className={styles.tileDesc}>{action.description}</span>
            </div>
            <span className={styles.arrow}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
