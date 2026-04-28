import React from 'react';
import PropTypes from 'prop-types';
import styles from './Spinner.module.css';

function Spinner({ size, label }) {
  return (
    <span
      className={`${styles.spinner} ${styles[size] || styles.md}`}
      role="status"
      aria-label={label || 'Loading'}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
};

Spinner.defaultProps = {
  size: 'md',
};

export default Spinner;
