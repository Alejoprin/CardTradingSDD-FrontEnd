import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import useTradeBuilder from '../../../../hooks/useTradeBuilder';
import cardService from '../../../../services/cardService';
import { parseApiError } from '../../../../utils/errors';
import { MAX_TRADE_CARDS_PER_SIDE } from '../../../../utils/constants';
import Placeholder from '../../../common/Placeholder/Placeholder';
import Button from '../../../common/Button/Button';
import Spinner from '../../../common/Spinner/Spinner';
import styles from './TradeBuilder.module.css';

function CardPickerGrid({ cards, selectedIds, onToggle, loading }) {
  const { t } = useTranslation();
  if (loading) return <div className={styles.center}><Spinner /></div>;
  if (!cards.length) return <p className={styles.empty}>{t('tradeBuilder.noCardsAvailable')}</p>;
  return (
    <div className={styles.pickerGrid}>
      {cards.map(card => (
        <button
          key={card.id}
          type="button"
          onClick={() => onToggle(card)}
          className={`${styles.pickerCard} ${selectedIds.includes(card.id) ? styles.selected : ''}`}
          aria-pressed={selectedIds.includes(card.id)}
          aria-label={`${selectedIds.includes(card.id) ? t('common.deselect') || 'Deselect' : t('common.select') || 'Select'} ${card.name}`}
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

// ── Card search autocomplete ──────────────────────────────────────────────────
function CardSearchInput({ onSelectCard }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await cardService.searchCards(val);
        setResults(data.content || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleSelect(card) {
    setQuery(card.name);
    setOpen(false);
    onSelectCard(card);
  }

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <div className={styles.searchInputRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={t('tradeBuilder.searchCard')}
          value={query}
          onChange={handleChange}
          autoComplete="off"
        />
        {searching && <Spinner size="sm" />}
      </div>
      {open && results.length > 0 && (
        <ul className={styles.searchDropdown}>
          {results.map(card => (
            <li key={card.id}>
              <button
                type="button"
                className={styles.searchItem}
                onClick={() => handleSelect(card)}
              >
                {card.imageSmallUrl
                  ? <img src={card.imageSmallUrl} alt={card.name} className={styles.searchThumb} />
                  : <div className={styles.searchThumbPlaceholder}>🃏</div>
                }
                <div className={styles.searchItemInfo}>
                  <span className={styles.searchItemName}>{card.name}</span>
                  <span className={styles.searchItemMeta}>{card.gameName} · {card.setName}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !searching && results.length === 0 && (
        <div className={styles.searchEmpty}>{t('tradeBuilder.noCardsFound')}</div>
      )}
    </div>
  );
}

// ── Owner list ────────────────────────────────────────────────────────────────
function OwnerList({ cardId, onSelectOwner, selectedOwnerId }) {
  const { t } = useTranslation();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    setLoading(true);
    cardService.getCardOwners(cardId)
      .then(setOwners)
      .catch(() => setOwners([]))
      .finally(() => setLoading(false));
  }, [cardId]);

  if (loading) return <div className={styles.center}><Spinner /></div>;
  if (!owners.length) return <p className={styles.empty}>{t('tradeBuilder.noOwners')}</p>;

  return (
    <ul className={styles.ownerList}>
      {owners.map(owner => (
        <li key={owner.userId}>
          <button
            type="button"
            className={`${styles.ownerItem} ${selectedOwnerId === owner.userId ? styles.ownerSelected : ''}`}
            onClick={() => onSelectOwner(owner)}
          >
            <div className={styles.ownerAvatar}>
              {owner.profileImageUrl
                ? <img src={owner.profileImageUrl} alt={owner.username} className={styles.ownerAvatarImg} />
                : owner.username?.charAt(0).toUpperCase()
              }
            </div>
            <div className={styles.ownerInfo}>
              <span className={styles.ownerName}>{owner.username}</span>
              <span className={styles.ownerMeta}>Qty: {owner.quantity} · {t(`cardConditions.${owner.condition.toLowerCase()}`) || owner.condition.replace('_', ' ')}</span>
            </div>
            {selectedOwnerId === owner.userId && (
              <span className={styles.ownerCheck}>✓</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── Main TradeBuilder ─────────────────────────────────────────────────────────
function TradeBuilder({ initialTargetUserId, initialCardId, onSuccess }) {
  const { t } = useTranslation();
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

  // Step 2 new state
  const [selectedCatalogCard, setSelectedCatalogCard] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setOwnLoading(true);
    cardService.getUserInventory(user.id, { size: 50 })
      .then(data => setOwnCards((data.content || []).map(item => ({ ...item, id: item.userCardId, name: item.cardName }))))
      .catch(err => console.error(parseApiError(err).message))
      .finally(() => setOwnLoading(false));
  }, [user?.id]);

  // Load target cards when owner is selected
  useEffect(() => {
    if (!targetUserId) return;
    setTargetLoading(true);
    cardService.getUserInventory(targetUserId, { size: 50 })
      .then(data => setTargetCards((data.content || []).map(item => ({ ...item, id: item.userCardId, name: item.cardName }))))
      .catch(err => console.error(parseApiError(err).message))
      .finally(() => setTargetLoading(false));
  }, [targetUserId]);

  function handleSelectOwner(owner) {
    setSelectedOwner(owner);
    setTargetUserId(owner.userId);
  }

  const ownSelectedIds = selectedOwnCards.map(c => c.id);
  const targetSelectedIds = selectedTargetCards.map(c => c.id);

  return (
    <div className={styles.builder}>
      <div className={styles.stepIndicator}>
        {['tradeBuilder.yourCards', 'tradeBuilder.theirCards', 'tradeBuilder.review'].map((label, i) => (
          <div key={i} className={`${styles.stepDot} ${step > i + 1 ? styles.done : ''} ${step === i + 1 ? styles.current : ''}`}>
            <span className={styles.dotNum}>{i + 1}</span>
            <span className={styles.dotLabel}>{t(label)}</span>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Step 1 — sin cambios */}
      {step === 1 && (
        <div>
          <h2 className={styles.stepTitle}>{t('tradeBuilder.step1Title')}</h2>
          <p className={styles.hint}>{t('tradeBuilder.step1Hint', { max: MAX_TRADE_CARDS_PER_SIDE, selected: selectedOwnCards.length })}</p>
          <CardPickerGrid cards={ownCards} selectedIds={ownSelectedIds} onToggle={toggleOwnCard} loading={ownLoading} />
          <div className={styles.nav}>
            <Button label={t('common.next')} onClick={nextStep} disabled={!selectedOwnCards.length} />
          </div>
        </div>
      )}

      {/* Step 2 — nuevo flujo */}
      {step === 2 && (
        <div>
          <h2 className={styles.stepTitle}>{t('tradeBuilder.step2Title')}</h2>

          {/* 2a — buscar carta */}
          <div className={styles.stepSection}>
            <p className={styles.sectionLabel}>1. {t('tradeBuilder.searchCard')}</p>
            <CardSearchInput onSelectCard={(card) => {
              setSelectedCatalogCard(card);
              setSelectedOwner(null);
              setTargetUserId('');
            }} />
          </div>

          {/* 2b — elegir owner */}
          {selectedCatalogCard && (
            <div className={styles.stepSection}>
              <p className={styles.sectionLabel}>
                2. {t('tradeBuilder.selectUser', { cardName: selectedCatalogCard.name })}
              </p>
              <OwnerList
                cardId={selectedCatalogCard.id}
                onSelectOwner={handleSelectOwner}
                selectedOwnerId={selectedOwner?.userId}
              />
            </div>
          )}

          {/* 2c — elegir cartas del owner */}
          {targetUserId && (
            <div className={styles.stepSection}>
              <p className={styles.sectionLabel}>
                3. {t('tradeBuilder.selectFromInventory', { username: selectedOwner?.username })}
              </p>
              <p className={styles.hint}>{t('tradeBuilder.selectedCount', { selected: selectedTargetCards.length, max: MAX_TRADE_CARDS_PER_SIDE })}</p>
              <CardPickerGrid
                cards={targetCards}
                selectedIds={targetSelectedIds}
                onToggle={toggleTargetCard}
                loading={targetLoading}
              />
            </div>
          )}

          <div className={styles.nav}>
            <Button label={t('common.back')} onClick={prevStep} variant="secondary" />
            <Button label={t('tradeBuilder.reviewTrade')} onClick={nextStep} disabled={!selectedTargetCards.length} />
          </div>
        </div>
      )}

      {/* Step 3 — sin cambios */}
      {step === 3 && (
        <div>
          <h2 className={styles.stepTitle}>{t('tradeBuilder.step3Title')}</h2>
          <div className={styles.review}>
            <div className={styles.reviewCol}>
              <h3>{t('tradeBuilder.reviewYouOffer')}</h3>
              {selectedOwnCards.map(c => <p key={c.id}>{c.name}</p>)}
            </div>
            <span className={styles.reviewArrow}>⇄</span>
            <div className={styles.reviewCol}>
              <h3>{t('tradeBuilder.reviewYouReceive')}</h3>
              {selectedTargetCards.map(c => <p key={c.id}>{c.name}</p>)}
            </div>
          </div>
          <div className={styles.nav}>
            <Button label={t('common.back')} onClick={prevStep} variant="secondary" />
            <Button label={t('tradeBuilder.sendProposal')} onClick={() => submit(onSuccess)} isLoading={loading} />
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