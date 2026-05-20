import React from 'react';
import i18n from '../../../i18n/i18n';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[CardTrading] Unhandled error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback}>
          <h2 className={styles.title}>{i18n.t('common.somethingWentWrong')}</h2>
          <p className={styles.message}>
            {i18n.t('common.unexpectedErrorMessage')}
          </p>
          <button
            className={styles.refreshBtn}
            onClick={() => window.location.reload()}
          >
            {i18n.t('common.refreshPage')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
