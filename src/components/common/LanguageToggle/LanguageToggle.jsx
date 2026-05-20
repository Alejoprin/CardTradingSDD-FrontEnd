import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageToggle.module.css';

function LanguageToggle() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  function handleChange(e) {
    i18n.changeLanguage(e.target.value);
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor="language-select" className={styles.label}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </label>
      <select
        id="language-select"
        className={styles.select}
        value={i18n.language}
        onChange={handleChange}
        aria-label="Select language"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageToggle;
