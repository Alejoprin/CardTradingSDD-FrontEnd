import React, { useState } from 'react';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { trades, loading, error, activeTab, changeTab, refetch } = useTradesList();
  const { loading: actionLoading, accept, reject, cancel } = useTradeAction();
  const [confirmModal, setConfirmModal] = useState(null); // { action, trade }

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
    accept: 'Accept this trade? Both inventories will be updated immediately.',
    reject: 'Reject this trade proposal?',
    cancel: 'Cancel this trade proposal? The other user will be notified.',
  };

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Trades</h1>
          <Button label="Propose Trade" onClick={() => navigate('/trades/create')} />
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
        title={confirmModal ? `${confirmModal.action.charAt(0).toUpperCase() + confirmModal.action.slice(1)} Trade` : ''}
      >
        {confirmModal && <p>{confirmMessages[confirmModal.action]}</p>}
        <div className={styles.modalActions}>
          <Button label="Back" onClick={() => setConfirmModal(null)} variant="secondary" />
          <Button
            label="Confirm"
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
