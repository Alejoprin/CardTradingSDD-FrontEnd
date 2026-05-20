import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from './ProfileCard.module.css';

function ProfileCard({ profile, showEmail, onImageUpload, uploadLoading }) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const initials = profile.username?.charAt(0).toUpperCase() || '?';
  const avatarUrl = profile.profileImageUrl || profile.avatarUrl;

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && onImageUpload) onImageUpload(file);
    e.target.value = '';
  }

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        <div
          className={`${styles.avatarWrapper} ${onImageUpload ? styles.avatarClickable : ''}`}
          onClick={() => onImageUpload && fileRef.current?.click()}
          title={onImageUpload ? t('profile.changePhoto') : undefined}
        >
          {avatarUrl
            ? <img src={avatarUrl} alt={profile.username} className={styles.avatarImg} />
            : <span className={styles.avatarInitials}>{initials}</span>
          }
          {onImageUpload && (
            <div className={`${styles.avatarOverlay} ${uploadLoading ? styles.avatarOverlayLoading : ''}`}>
              <span>{uploadLoading ? '…' : '📷'}</span>
            </div>
          )}
        </div>
        {onImageUpload && (
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className={styles.fileInputHidden}
            aria-label={t('profile.uploadPhoto')}
          />
        )}
      </div>
      <div className={styles.info}>
        <h2 className={styles.username}>{profile.username}</h2>
        {showEmail && profile.email && (
          <p className={styles.email}>{profile.email}</p>
        )}
        {profile.location && (
          <p className={styles.location}>{profile.location}</p>
        )}
        {profile.bio && (
          <p className={styles.bio}>{profile.bio}</p>
        )}
      </div>
    </div>
  );
}

ProfileCard.propTypes = {
  profile: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string,
    profileImageUrl: PropTypes.string,
    avatarUrl: PropTypes.string,
    bio: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  showEmail: PropTypes.bool,
  onImageUpload: PropTypes.func,
  uploadLoading: PropTypes.bool,
};

ProfileCard.defaultProps = {
  showEmail: false,
  onImageUpload: null,
  uploadLoading: false,
};

export default ProfileCard;
