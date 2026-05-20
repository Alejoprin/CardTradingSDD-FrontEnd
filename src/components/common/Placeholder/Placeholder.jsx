import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import styles from './Placeholder.module.css';

function Placeholder({ size }) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.placeholder} ${styles[size] || styles.md}`} aria-label={t('common.noImageAvailable')}>
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

Placeholder.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Placeholder.defaultProps = {
  size: 'md',
};

export default Placeholder;
