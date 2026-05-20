import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useTradesList from '../../hooks/useTradesList';
import useTradeAction from '../../hooks/useTradeAction';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import TradeList from '../../components/features/trades/TradeList/TradeList';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import styles from './TradesPage.module.css';

function TradesPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { trades, loading, error, activeTab, changeTab, refetch } = useTradesList();
  const { loading: actionLoading, accept, reject, cancel } = useTradeAction();
  const [confirmModal, setConfirmModal] = useState(null);

  async function handleConfirm() {
    if (!confirmModal) return;
    const { action, trade } = confirmModal;
    setConfirmModal(null);
    try {
      if (action === 'accept') await accept(trade.id);
      else if (action === 'reject') await reject(trade.id);
      else if (action === 'cancel') await cancel(trade.id);
      refetch();
    } catch {
      // Toast shown by hook
    }
  }

  const confirmMessages = {
    accept: t('trades.acceptMessage'),
    reject: t('trades.rejectMessage'),
    cancel: t('trades.cancelMessage'),
  };

  const confirmTitles = {
    accept: t('trades.acceptTrade'),
    reject: t('trades.rejectTrade'),
    cancel: t('trades.cancelTrade'),
  };

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('trades.title')}</h1>
          <Button label={t('trades.proposeTrade')} onClick={() => navigate('/trades/create')} />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <TradeList
          trades={trades}
          loading={loading}
          activeTab={activeTab}
          onTabChange={changeTab}
          currentUserId={user?.id}
          onAccept={trade => setConfirmModal({ action: 'accept', trade })}
          onReject={trade => setConfirmModal({ action: 'reject', trade })}
          onCancel={trade => setConfirmModal({ action: 'cancel', trade })}
        />
      </div>

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal ? confirmTitles[confirmModal.action] : ''}
      >
        {confirmModal && <p>{confirmMessages[confirmModal.action]}</p>}
        <div className={styles.modalActions}>
          <Button label={t('common.back')} onClick={() => setConfirmModal(null)} variant="secondary" />
          <Button
            label={t('common.confirm')}
            onClick={handleConfirm}
            variant={confirmModal?.action === 'accept' ? 'primary' : confirmModal?.action === 'reject' ? 'secondary' : 'ghost'}
            isLoading={actionLoading}
          />
        </div>
      </Modal>
    </MainLayout>
  );
}

export default TradesPage;
