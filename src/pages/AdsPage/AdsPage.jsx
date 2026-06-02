import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import AdList from '../../components/features/ads/AdList/AdList';
import Button from '../../components/common/Button/Button';
import useAds from '../../hooks/useAds';
import styles from './AdsPage.module.css';

function AdsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { ads, loading, error, activeTab, cardSearch, changeTab, setCardSearch, setPage, pagination } = useAds();

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('ads.title')}</h1>
          <Button
            label={t('ads.createAd')}
            onClick={() => navigate('/ads/create')}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <AdList
          ads={ads}
          activeTab={activeTab}
          onTabChange={changeTab}
          cardSearch={cardSearch}
          onCardSearchChange={setCardSearch}
          currentUserId={user?.id}
          loading={loading}
        />

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {t('common.previous')}
            </button>
            <span>{t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AdsPage;
