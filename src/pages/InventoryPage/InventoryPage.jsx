import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import useInventory from '../../hooks/useInventory';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardGrid from '../../components/features/cards/CardGrid/CardGrid';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import cardService from '../../services/cardService';
import { parseApiError } from '../../utils/errors';
import styles from './InventoryPage.module.css';
import { useState } from 'react';

function InventoryPage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { cards, loading, error, pagination, setPage, refetch } = useInventory(user?.id);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await cardService.deleteCard(deleteTarget.id);
      addToast('success', `"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Inventory</h1>
          {user?.role === 'ADMIN' && (
            <Button label="Add Card" onClick={() => navigate('/cards/create')} />
          )}
        </div>


        {error && <p className={styles.error}>{error}</p>}

        <CardGrid
          cards={cards}
          loading={loading}
          isOwn={true}
          emptyMessage="No cards in your inventory yet."
          onEdit={card => navigate(`/cards/${card.id}/edit`)}
          onDelete={card => setDeleteTarget(card)}
        />

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label="Previous" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} variant="secondary" />
            <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
            <Button label="Next" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} variant="secondary" />
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Card"
      >
        <p>Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>?</p>
        <p className={styles.deleteWarning}>This cannot be undone. Cards in pending trades cannot be deleted.</p>
        <div className={styles.modalActions}>
          <Button label="Cancel" onClick={() => setDeleteTarget(null)} variant="secondary" />
          <Button label="Delete" onClick={handleDelete} variant="danger" isLoading={deleteLoading} />
        </div>
      </Modal>
    </MainLayout>
  );
}

export default InventoryPage;
