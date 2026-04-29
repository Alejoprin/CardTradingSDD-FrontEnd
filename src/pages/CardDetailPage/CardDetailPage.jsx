import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCardDetail from '../../hooks/useCardDetail';
import useDeleteCard from '../../hooks/useDeleteCard';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardDetail from '../../components/features/cards/CardDetail/CardDetail';
import Modal from '../../components/common/Modal/Modal';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Spinner/Spinner';
import styles from './CardDetailPage.module.css';

function CardDetailPage() {
  const { cardId } = useParams();
  const { user, logout } = useAuth();
  const { card, loading, error } = useCardDetail(cardId);
  const { loading: deleting, deleteCard } = useDeleteCard();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        {loading && (
          <div className={styles.center}><Spinner size="lg" /></div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {card && (
          <CardDetail
            card={card}
            isOwn={isAdmin}
            onDelete={() => setShowDeleteModal(true)}
          />
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Card"
      >
        <p>Are you sure you want to permanently delete <strong>{card?.name}</strong>?</p>
        <p className={styles.warning}>This cannot be undone. Cards in pending trades cannot be deleted.</p>
        <div className={styles.modalActions}>
          <Button label="Cancel" onClick={() => setShowDeleteModal(false)} variant="secondary" />
          <Button
            label="Delete"
            onClick={() => { setShowDeleteModal(false); deleteCard(cardId, card?.name); }}
            variant="danger"
            isLoading={deleting}
          />
        </div>
      </Modal>
    </MainLayout>
  );
}

export default CardDetailPage;
