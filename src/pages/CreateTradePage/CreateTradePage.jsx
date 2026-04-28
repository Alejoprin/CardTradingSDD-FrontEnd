import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import TradeBuilder from '../../components/features/trades/TradeBuilder/TradeBuilder';
import styles from './CreateTradePage.module.css';

function CreateTradePage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetUserId = searchParams.get('targetUserId') || '';
  const cardId = searchParams.get('cardId') || '';

  function handleSuccess() {
    addToast('success', 'Trade proposal sent!');
    navigate('/trades', { replace: true });
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>Propose a Trade</h1>
        <TradeBuilder
          initialTargetUserId={targetUserId}
          initialCardId={cardId}
          onSuccess={handleSuccess}
        />
      </div>
    </MainLayout>
  );
}

export default CreateTradePage;
