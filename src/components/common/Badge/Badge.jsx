import React from 'react';
import PropTypes from 'prop-types';
import styles from './Badge.module.css';

function Badge({ label, variant = 'neutral' }) {
  return (
    <span className={`${styles.badge} ${styles[variant] || styles.neutral}`}>
      {label}
    </span>
  );
}

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info', 'neutral']),
};


export default Badge;
