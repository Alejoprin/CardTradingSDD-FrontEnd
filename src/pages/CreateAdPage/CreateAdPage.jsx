import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import AdForm from '../../components/features/ads/AdForm/AdForm';
import Button from '../../components/common/Button/Button';
import useCreateAd from '../../hooks/useCreateAd';
import cardService from '../../services/cardService';
import styles from './CreateAdPage.module.css';

function CreateAdPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const form = useCreateAd();
  const [inventoryCards, setInventoryCards] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setInventoryLoading(true);
    cardService.getUserInventory(user.id, { size: 200, page: 0 })
      .then(data => {
        setInventoryCards((data.content || []).map(item => ({
          ...item,
          id: item.userCardId,
          name: item.cardName,
        })));
      })
      .catch(() => {})
      .finally(() => setInventoryLoading(false));
  }, [user?.id]);

  const handleSelectCard = (card) => {
    form.setCardId(card.cardId || card.id);
    form.setCardName(card.cardName || card.name);
    form.setCardImageUrl(card.imageUrl);
  };

  const handleSubmit = () => {
    form.submit((ad) => {
      navigate(`/ads/${ad.id}`);
    });
  };

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>{t('ads.createAd')}</h1>

        {form.error && <p className={styles.error}>{form.error}</p>}

        <AdForm
          type={form.type}
          setType={form.setType}
          cardName={form.cardName}
          cardImageUrl={form.cardImageUrl}
          price={form.price}
          setPrice={form.setPrice}
          description={form.description}
          setDescription={form.setDescription}
          loading={form.loading}
          inventoryCards={inventoryCards}
          inventoryLoading={inventoryLoading}
          onSelectCard={handleSelectCard}
        />

        <div className={styles.actions}>
          <Button
            label={t('common.cancel')}
            onClick={() => navigate('/ads')}
            variant="ghost"
          />
          <Button
            label={t('ads.publish')}
            onClick={handleSubmit}
            isLoading={form.loading}
            disabled={!form.cardId}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateAdPage;
