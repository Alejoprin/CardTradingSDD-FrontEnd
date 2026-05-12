import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../../context/AuthContext';
import useTradeBuilder from '../../../../hooks/useTradeBuilder';
import cardService from '../../../../services/cardService';
import { parseApiError } from '../../../../utils/errors';
import { MAX_TRADE_CARDS_PER_SIDE } from '../../../../utils/constants';
import Placeholder from '../../../common/Placeholder/Placeholder';
import Button from '../../../common/Button/Button';
import Spinner from '../../../common/Spinner/Spinner';
import Input from '../../../common/Input/Input';
import styles from './TradeBuilder.module.css';

function CardPickerGrid({ cards, selectedIds, onToggle, loading }) {
  if (loading) return <div className={styles.center}><Spinner /></div>;
  if (!cards.length) return <p className={styles.empty}>No cards available.</p>;
  return (
    <div className={styles.pickerGrid}>
      {cards.map(card => (
        <button
          key={card.id}
          type="button"
          onClick={() => onToggle(card)}
          className={`${styles.pickerCard} ${selectedIds.includes(card.id) ? styles.selected : ''}`}
          aria-pressed={selectedIds.includes(card.id)}
          aria-label={`${selectedIds.includes(card.id) ? 'Deselect' : 'Select'} ${card.name}`}
        >
          {(card.imageSmallUrl || card.imageUrl)
            ? <img src={card.imageSmallUrl || card.imageUrl} alt={card.name} className={styles.pickerImg} />
            : <Placeholder size="sm" />
          }
          <span className={styles.pickerName}>{card.name}</span>
          {selectedIds.includes(card.id) && <span className={styles.checkmark} aria-hidden="true">✓</span>}
        </button>
      ))}
    </div>
  );
}

function TradeBuilder({ initialTargetUserId, initialCardId, onSuccess }) {
  const { user } = useAuth();
  const {
    step, selectedOwnCards, selectedTargetCards, targetUserId,
    loading, error, setTargetUserId, toggleOwnCard, toggleTargetCard,
    nextStep, prevStep, submit,
  } = useTradeBuilder(initialTargetUserId, initialCardId);

  const [ownCards, setOwnCards] = useState([]);
  const [targetCards, setTargetCards] = useState([]);
  const [ownLoading, setOwnLoading] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetUserInput, setTargetUserInput] = useState(initialTargetUserId || '');

  useEffect(() => {
    if (!user?.id) return;
    setOwnLoading(true);
    cardService.getUserInventory(user.id, { size: 50 })
      .then(data => setOwnCards((data.content || []).map(item => ({ ...item, id: item.userCardId, name: item.cardName }))))
      .catch(err => console.error(parseApiError(err).message))
      .finally(() => setOwnLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!targetUserId) return;
    setTargetLoading(true);
    cardService.getUserInventory(targetUserId, { size: 50 })
      .then(data => setTargetCards((data.content || []).map(item => ({ ...item, id: item.userCardId, name: item.cardName }))))
      .catch(err => console.error(parseApiError(err).message))
      .finally(() => setTargetLoading(false));
  }, [targetUserId]);

  const ownSelectedIds = selectedOwnCards.map(c => c.id);
  const targetSelectedIds = selectedTargetCards.map(c => c.id);

  return (
    <div className={styles.builder}>
      <div className={styles.stepIndicator}>
        {['Your Cards', "Their Cards", 'Review'].map((label, i) => (
          <div key={i} className={`${styles.stepDot} ${step > i + 1 ? styles.done : ''} ${step === i + 1 ? styles.current : ''}`}>
            <span className={styles.dotNum}>{i + 1}</span>
            <span className={styles.dotLabel}>{label}</span>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {step === 1 && (
        <div>
          <h2 className={styles.stepTitle}>Step 1: Select your cards to offer</h2>
          <p className={styles.hint}>Select up to {MAX_TRADE_CARDS_PER_SIDE} cards. Selected: {selectedOwnCards.length}/{MAX_TRADE_CARDS_PER_SIDE}</p>
          <CardPickerGrid cards={ownCards} selectedIds={ownSelectedIds} onToggle={toggleOwnCard} loading={ownLoading} />
          <div className={styles.nav}>
            <Button label="Next" onClick={nextStep} disabled={!selectedOwnCards.length} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className={styles.stepTitle}>Step 2: Select cards to request</h2>
          {!initialTargetUserId && (
            <div className={styles.userIdRow}>
              <Input
                name="targetUserId"
                label="Target User ID"
                value={targetUserInput}
                onChange={e => setTargetUserInput(e.target.value)}
                placeholder="Paste the user ID"
              />
              <Button label="Load Cards" onClick={() => setTargetUserId(targetUserInput)} variant="secondary" />
            </div>
          )}
          {targetUserId && (
            <>
              <p className={styles.hint}>Select up to {MAX_TRADE_CARDS_PER_SIDE} cards. Selected: {selectedTargetCards.length}/{MAX_TRADE_CARDS_PER_SIDE}</p>
              <CardPickerGrid cards={targetCards} selectedIds={targetSelectedIds} onToggle={toggleTargetCard} loading={targetLoading} />
            </>
          )}
          <div className={styles.nav}>
            <Button label="Back" onClick={prevStep} variant="secondary" />
            <Button label="Review Trade" onClick={nextStep} disabled={!selectedTargetCards.length} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className={styles.stepTitle}>Step 3: Review and confirm</h2>
          <div className={styles.review}>
            <div className={styles.reviewCol}>
              <h3>You offer</h3>
              {selectedOwnCards.map(c => <p key={c.id}>{c.name}</p>)}
            </div>
            <span className={styles.reviewArrow}>⇄</span>
            <div className={styles.reviewCol}>
              <h3>You receive</h3>
              {selectedTargetCards.map(c => <p key={c.id}>{c.name}</p>)}
            </div>
          </div>
          <div className={styles.nav}>
            <Button label="Back" onClick={prevStep} variant="secondary" />
            <Button label="Send Proposal" onClick={() => submit(onSuccess)} isLoading={loading} />
          </div>
        </div>
      )}
    </div>
  );
}

TradeBuilder.propTypes = {
  initialTargetUserId: PropTypes.string,
  initialCardId: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default TradeBuilder;
