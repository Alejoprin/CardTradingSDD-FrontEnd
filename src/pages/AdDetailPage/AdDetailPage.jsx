import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Badge from '../../components/common/Badge/Badge';
import Placeholder from '../../components/common/Placeholder/Placeholder';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Spinner/Spinner';
import useAdDetail from '../../hooks/useAdDetail';
import chatService from '../../services/chatService';
import { AD_TYPE_BADGE_VARIANTS, getImageUrl } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import styles from './AdDetailPage.module.css';

function AdDetailPage() {
  const { t } = useTranslation();
  const { adId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { ad, loading, error } = useAdDetail(adId);

  const handleContact = async () => {
    try {
      const chat = await chatService.createChat(adId);
      navigate(`/chats/${chat.id}`);
    } catch {
      // error handled by toast
    }
  };

  if (loading) {
    return (
      <MainLayout user={user} onLogout={logout}>
        <div className={styles.center}><Spinner size="lg" /></div>
      </MainLayout>
    );
  }

  if (error || !ad) {
    return (
      <MainLayout user={user} onLogout={logout}>
        <p className={styles.error}>{error || t('common.error')}</p>
      </MainLayout>
    );
  }

  const src = getImageUrl(ad.cardImageUrl);
  const isOwner = ad.userId === user?.id;

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <Link to="/ads" className={styles.back}>← {t('ads.backToAds')}</Link>

        <div className={styles.detail}>
          <div className={styles.imageWrap}>
            {src
              ? <img src={src} alt={ad.cardName} className={styles.image} />
              : <Placeholder size="lg" />
            }
          </div>

          <div className={styles.info}>
            <div className={styles.top}>
              <h1 className={styles.cardName}>{ad.cardName}</h1>
              <Badge
                label={t(`ads.${ad.type.toLowerCase()}`)}
                variant={AD_TYPE_BADGE_VARIANTS[ad.type]}
              />
            </div>

            {ad.type === 'SELL' && ad.price != null && (
              <span className={styles.price}>${Number(ad.price).toFixed(2)}</span>
            )}

            {ad.description && (
              <p className={styles.description}>{ad.description}</p>
            )}

            <div className={styles.meta}>
              <span>{t('ads.postedBy')} <Link to={`/users/${ad.userId}`}>{ad.username}</Link></span>
              <span>{formatDate(ad.createdAt)}</span>
            </div>

            {!isOwner && (
              <Button
                label={t('ads.contact')}
                onClick={handleContact}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdDetailPage;
