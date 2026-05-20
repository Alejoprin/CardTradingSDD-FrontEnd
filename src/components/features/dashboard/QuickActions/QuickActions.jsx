import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import styles from './QuickActions.module.css';

const BASE_ACTIONS = [
  {
    icon: '🔍',
    label: 'Explore Catalog',
    description: 'Browse all available cards',
    path: '/catalog',
    accent: '#1E88E5',
    accentBg: '#E3F2FD',
  },
  {
    icon: '🔄',
    label: 'My Trades',
    description: 'Check and manage your trades',
    path: '/trades',
    accent: '#4CAF50',
    accentBg: '#E8F5E9',
  },
];

const ADMIN_ACTION = {
  icon: '➕',
  label: 'Add Card',
  description: 'Create a new card in the catalog',
  path: '/cards/create',
  accent: '#FF9800',
  accentBg: '#FFF3E0',
};

function ActionTile({ icon, label, description, path, accent, accentBg, onClick }) {
  return (
    <button
      className={styles.tile}
      onClick={onClick}
      style={{ '--tile-accent': accent, '--tile-accent-bg': accentBg }}
    >
      <div className={styles.iconBubble}>{icon}</div>
      <div className={styles.tileContent}>
        <span className={styles.tileLabel}>{label}</span>
        <span className={styles.tileDesc}>{description}</span>
      </div>
      <span className={styles.arrow}>›</span>
    </button>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const actions = isAdmin ? [ADMIN_ACTION, ...BASE_ACTIONS] : BASE_ACTIONS;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Quick Actions</h2>
      <div className={styles.list}>
        {actions.map(action => (
          <ActionTile
            key={action.path}
            {...action}
            onClick={() => navigate(action.path)}
          />
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
