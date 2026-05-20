import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>&copy; {new Date().getFullYear()} {t('footer.copyright')}</span>
      </div>
    </footer>
  );
}

export default Footer;
