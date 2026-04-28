import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>&copy; {new Date().getFullYear()} CardTrading Platform. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
