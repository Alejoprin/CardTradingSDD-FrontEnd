import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProfileCard.module.css';

function ProfileCard({ profile, showEmail, readonly }) {
  const initials = profile.username?.charAt(0).toUpperCase() || '?';

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {profile.avatarUrl
          ? <img src={profile.avatarUrl} alt={profile.username} className={styles.avatarImg} />
          : <span className={styles.avatarInitials}>{initials}</span>
        }
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
    avatarUrl: PropTypes.string,
    bio: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  showEmail: PropTypes.bool,
  readonly: PropTypes.bool,
};

ProfileCard.defaultProps = {
  showEmail: false,
  readonly: false,
};

export default ProfileCard;
