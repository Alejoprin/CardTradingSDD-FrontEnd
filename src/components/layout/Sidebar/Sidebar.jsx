import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/inventory', label: 'My Inventory' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/trades', label: 'Trades' },
  { to: '/profile', label: 'Profile' },
];

function Sidebar({ isOpen }) {
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
