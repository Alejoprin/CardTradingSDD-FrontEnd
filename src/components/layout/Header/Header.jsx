import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import LanguageToggle from '../../common/LanguageToggle/LanguageToggle';
import { useUI } from '../../../context/UIContext';
import styles from './Header.module.css';

function Header({ user, onLogout }) {
  const { t } = useTranslation();
  const { toggleSidebar } = useUI();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Hamburger — solo visible en mobile */}
        <button
          className={styles.hamburger}
          onClick={toggleSidebar}
          aria-label={t('common.toggleMenu')}
        >
          <span /><span /><span />
        </button>

        <Link to="/dashboard" className={styles.logo}>
          CardTrading
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <Link to="/dashboard" className={styles.navLink}>{t('navigation.dashboard')}</Link>
          <Link to="/inventory" className={styles.navLink}>{t('navigation.myCards')}</Link>
          <Link to="/catalog" className={styles.navLink}>{t('navigation.catalog')}</Link>
          <Link to="/trades" className={styles.navLink}>{t('navigation.trades')}</Link>
          <Link to="/ads" className={styles.navLink}>{t('navigation.ads')}</Link>
          <Link to="/chats" className={styles.navLink}>{t('navigation.chats')}</Link>
        </nav>

        <div className={styles.actions}>
          <LanguageToggle />
          {user && (
            <Link to="/profile" className={styles.userInfo} aria-label={t('navigation.profile')}>
              {(user.profileImageUrl || user.avatarUrl)
                ? <img src={user.profileImageUrl || user.avatarUrl} alt={user.username} className={styles.avatar} />
                : <span className={styles.avatarPlaceholder}>{user.username?.charAt(0).toUpperCase()}</span>
              }
              <span className={styles.username}>{user.username}</span>
            </Link>
          )}
          {onLogout && (
            <Button label={t('auth.signOut')} onClick={onLogout} variant="ghost" />
          )}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    profileImageUrl: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  onLogout: PropTypes.func,
};

export default Header;