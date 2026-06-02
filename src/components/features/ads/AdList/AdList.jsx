import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AdCard from '../AdCard/AdCard';
import Input from '../../../common/Input/Input';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './AdList.module.css';

function AdList({ ads, activeTab, onTabChange, cardSearch, onCardSearchChange, currentUserId, loading }) {
  const { t } = useTranslation();

  const TABS = [
    { key: 'SELL', label: t('ads.sell') },
    { key: 'TRADE', label: t('ads.trade') },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Input
          name="cardSearch"
          placeholder={t('ads.cardPlaceholder')}
          value={cardSearch}
          onChange={(e) => onCardSearchChange(e.target.value)}
        />
      </div>

      <div role="tabpanel">
        {loading ? (
          <div className={styles.center}><Spinner size="lg" /></div>
        ) : ads.length === 0 ? (
          <p className={styles.empty}>{t('ads.noAds')}</p>
        ) : (
          <div className={styles.list}>
            {ads.map(ad => (
              <AdCard key={ad.id} ad={ad} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

AdList.propTypes = {
  ads: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  cardSearch: PropTypes.string,
  onCardSearchChange: PropTypes.func.isRequired,
  currentUserId: PropTypes.string,
  loading: PropTypes.bool,
};

AdList.defaultProps = {
  loading: false,
  cardSearch: '',
};

export default AdList;
