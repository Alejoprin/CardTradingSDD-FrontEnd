import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import TradeBuilder from '../../components/features/trades/TradeBuilder/TradeBuilder';
import styles from './CreateTradePage.module.css';

function CreateTradePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetUserId = searchParams.get('targetUserId') || '';
  const cardId = searchParams.get('userCardId') || '';

  function handleSuccess() {
    addToast('success', t('trades.proposalSent'));
    navigate('/trades', { replace: true });
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>{t('trades.proposeTradeTitle')}</h1>
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
