import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import styles from './EmptyState.module.css';

function EmptyState({ icon, message, ctaLabel, onCta }) {
  return (
    <div className={styles.wrapper}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <p className={styles.message}>{message}</p>
      {ctaLabel && onCta && (
        <Button label={ctaLabel} onClick={onCta} variant="secondary" />
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  message: PropTypes.string.isRequired,
  ctaLabel: PropTypes.string,
  onCta: PropTypes.func,
};

export default EmptyState;
