import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Input from '../../../common/Input/Input';
import Button from '../../../common/Button/Button';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './AdForm.module.css';

function AdForm({
  type, setType, cardName, cardImageUrl, price, setPrice,
  description, setDescription, loading,
  inventoryCards, inventoryLoading, onSelectCard,
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>{t('ads.adType')}</label>
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'SELL' ? styles.typeActive : ''}`}
            onClick={() => setType('SELL')}
          >
            {t('ads.sell')}
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'TRADE' ? styles.typeActive : ''}`}
            onClick={() => setType('TRADE')}
          >
            {t('ads.trade')}
          </button>
        </div>
      </div>

      {type === 'SELL' && (
        <Input
          name="price"
          label={t('ads.price')}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      )}

      <div className={styles.field}>
        <label className={styles.label}>{t('ads.description')}</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('ads.descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('ads.selectCard')}</label>
        {cardName && (
          <div className={styles.selectedCard}>
            {cardImageUrl && (
              <img src={cardImageUrl} alt={cardName} className={styles.selectedImg} />
            )}
            <span>{cardName}</span>
          </div>
        )}
        {inventoryLoading ? (
          <Spinner size="sm" />
        ) : (
          <div className={styles.inventoryGrid}>
            {inventoryCards.map(card => (
              <button
                key={card.id}
                type="button"
                className={styles.invCard}
                onClick={() => onSelectCard(card)}
              >
                {card.imageUrl && (
                  <img src={card.imageUrl} alt={card.cardName || card.name} className={styles.invImg} />
                )}
                <span className={styles.invName}>{card.cardName || card.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

AdForm.propTypes = {
  type: PropTypes.string.isRequired,
  setType: PropTypes.func.isRequired,
  cardName: PropTypes.string,
  cardImageUrl: PropTypes.string,
  price: PropTypes.string,
  setPrice: PropTypes.func.isRequired,
  description: PropTypes.string,
  setDescription: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  inventoryCards: PropTypes.array,
  inventoryLoading: PropTypes.bool,
  onSelectCard: PropTypes.func.isRequired,
};

export default AdForm;
