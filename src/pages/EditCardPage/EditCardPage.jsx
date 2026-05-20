import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import cardService from '../../services/cardService';
import { parseApiError } from '../../utils/errors';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardForm from '../../components/forms/CardForm/CardForm';
import Spinner from '../../components/common/Spinner/Spinner';
import styles from './EditCardPage.module.css';

function EditCardPage() {
  const { t } = useTranslation();
  const { cardId } = useParams();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await cardService.getCard(cardId);
        setCard(data);
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cardId]);

  function handleSuccess() {
    addToast('success', t('inventory.cardUpdated'));
    navigate(`/cards/${cardId}`, { replace: true });
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>{t('card.edit')}</h1>
        {loading && <div className={styles.center}><Spinner size="lg" /></div>}
        {error && <p className={styles.error}>{error}</p>}
        {card && (
          <div className={styles.formWrapper}>
            <CardForm
              mode="edit"
              initialValues={{ ...card, image: card.imageUrl || null }}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default EditCardPage;
