import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

function Modal({ isOpen, onClose, title, children, size }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length) focusable[0].focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog" aria-labelledby="modal-title">
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${styles[size] || styles.md}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          {title && <h2 id="modal-title" className={styles.title}>{title}</h2>}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            &#x2715;
          </button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Modal.defaultProps = {
  size: 'md',
};

export default Modal;
