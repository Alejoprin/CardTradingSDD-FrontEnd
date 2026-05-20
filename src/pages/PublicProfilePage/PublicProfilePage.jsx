import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useProfile from '../../hooks/useProfile';
import useInventory from '../../hooks/useInventory';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import ProfileCard from '../../components/features/profile/ProfileCard/ProfileCard';
import ProfileStats from '../../components/features/profile/ProfileStats/ProfileStats';
import CardGrid from '../../components/features/cards/CardGrid/CardGrid';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Spinner/Spinner';
import styles from './PublicProfilePage.module.css';

function PublicProfilePage() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, error: profileError } = useProfile(userId);
  const { cards, loading: cardsLoading } = useInventory(userId);

  const isOwnProfile = userId === user?.id;

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        {profileLoading && <div className={styles.center}><Spinner size="lg" /></div>}
        {profileError && <p className={styles.error}>{profileError}</p>}

        {profile && (
          <>
            <ProfileCard profile={profile} showEmail={false} readonly={true} />
            <ProfileStats stats={profile.stats || {}} />

            {!isOwnProfile && (
              <Button
                label={t('trades.proposeTrade')}
                onClick={() => navigate(`/trades/create?targetUserId=${userId}`)}
                className={styles.tradeBtn}
              />
            )}

            <div className={styles.cardsSection}>
              <h2 className={styles.cardsTitle}>{t('profile.cardsTitle', { username: profile.username })}</h2>
              <CardGrid
                cards={cards}
                loading={cardsLoading}
                showOwner={false}
                emptyMessage={t('profile.noCardsYet', { username: profile.username })}
                onProposeTrade={!isOwnProfile ? card => navigate(`/trades/create?targetUserId=${userId}&userCardId=${card.id}`) : undefined}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default PublicProfilePage;
