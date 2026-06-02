import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

function Sidebar({ isOpen }) {
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { to: '/dashboard', label: t('navigation.dashboard') },
    { to: '/inventory', label: t('navigation.myInventory') },
    { to: '/catalog', label: t('navigation.catalog') },
    { to: '/trades', label: t('navigation.trades') },
    { to: '/ads', label: t('navigation.ads') },
    { to: '/chats', label: t('navigation.chats') },
    { to: '/profile', label: t('navigation.profile') },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} aria-label="Sidebar navigation">
      <nav>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
};

export default Sidebar;
