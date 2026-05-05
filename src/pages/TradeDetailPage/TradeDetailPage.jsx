import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useTradeDetail from '../../hooks/useTradeDetail';
import useTradeAction from '../../hooks/useTradeAction';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import TradeDetail from '../../components/features/trades/TradeDetail/TradeDetail';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Spinner/Spinner';
import styles from './TradeDetailPage.module.css';

function TradeDetailPage() {
  const { tradeId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { trade, loading, error, refetch } = useTradeDetail(tradeId);
  const { loading: actionLoading, accept, reject, cancel } = useTradeAction();
  const [confirmModal, setConfirmModal] = useState(null);

  async function handleConfirm() {
    if (!confirmModal) return;
    const { action } = confirmModal;
    setConfirmModal(null);
    try {
      if (action === 'accept') await accept(tradeId);
      else if (action === 'reject') await reject(tradeId);
      else if (action === 'cancel') {
        await cancel(tradeId);
        navigate('/trades', { replace: true });
        return;
      }
      refetch();
    } catch {
      // Toast shown by hook
    }
  }

  const isCancelable = trade?.status === 'PENDING' && trade?.proposerId === user?.id;

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        {loading && <div className={styles.center}><Spinner size="lg" /></div>}
        {error && <p className={styles.error}>{error}</p>}
        {trade && (
          <TradeDetail
            trade={trade}
            currentUserId={user?.id}
            onAccept={t => setConfirmModal({ action: 'accept', trade: t })}
            onReject={t => setConfirmModal({ action: 'reject', trade: t })}
            onCancel={isCancelable ? t => setConfirmModal({ action: 'cancel', trade: t }) : undefined}
          />
        )}
      </div>

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal ? `${confirmModal.action.charAt(0).toUpperCase() + confirmModal.action.slice(1)} Trade` : ''}
      >
        {confirmModal?.action === 'accept' && (
          <p>Accept this trade? Both inventories will be updated and the trade cannot be reversed.</p>
        )}
        {confirmModal?.action === 'reject' && <p>Reject this trade proposal?</p>}
        {confirmModal?.action === 'cancel' && <p>Cancel this trade proposal? The other party will be notified.</p>}
        <div className={styles.modalActions}>
          <Button label="Back" onClick={() => setConfirmModal(null)} variant="secondary" />
          <Button
            label="Confirm"
            onClick={handleConfirm}
            variant={confirmModal?.action === 'accept' ? 'primary' : 'secondary'}
            isLoading={actionLoading}
          />
        </div>
      </Modal>
    </MainLayout>
  );
}

export default TradeDetailPage;
