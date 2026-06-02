import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge';
import Placeholder from '../../../common/Placeholder/Placeholder';
import { AD_TYPE_BADGE_VARIANTS, getImageUrl } from '../../../../utils/constants';
import { formatRelativeTime } from '../../../../utils/formatters';
import styles from './AdCard.module.css';

function AdCard({ ad, currentUserId }) {
  const { t } = useTranslation();
  const src = getImageUrl(ad.cardImageUrl);
  const isOwner = ad.userId === currentUserId;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        {src
          ? <img src={src} alt={ad.cardName} className={styles.image} />
          : <Placeholder size="sm" />
        }
      </div>
      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.cardName}>{ad.cardName}</span>
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
        <div className={styles.footer}>
          <span className={styles.user}>
            {isOwner
              ? t('ads.you')
              : (
                <Link to={`/users/${ad.userId}`}>{ad.username}</Link>
              )
            }
          </span>
          <span className={styles.time}>{formatRelativeTime(ad.createdAt)}</span>
        </div>
        <Link to={`/ads/${ad.id}`} className={styles.viewLink}>
          {t('ads.viewAd')} →
        </Link>
      </div>
    </div>
  );
}

AdCard.propTypes = {
  ad: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    userId: PropTypes.string,
    username: PropTypes.string,
    cardName: PropTypes.string,
    cardImageUrl: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUserId: PropTypes.string,
};

export default AdCard;
