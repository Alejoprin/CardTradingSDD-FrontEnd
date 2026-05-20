import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import useCardForm from '../../../hooks/useCardForm';
import { CARD_RARITIES } from '../../../utils/constants';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import api from '../../../services/api';
import styles from './CardForm.module.css';

function CardForm({ initialValues, onSuccess, mode = 'create' }) {
  const { t } = useTranslation();
  const { values, errors, touched, isSubmitting, submitError, handleChange, handleImageChange, handleBlur, submit, setFieldValue } = useCardForm(initialValues, mode);
  const fileRef = useRef(null);

  const [games, setGames] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingSets, setLoadingSets] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [setsOpen, setSetsOpen] = useState(false);
  const [selectedGameLabel, setSelectedGameLabel] = useState(t('card.selectGame'));
  const [selectedSetLabel, setSelectedSetLabel] = useState(t('card.selectSet'));

  const gamesRef = useRef(null);
  const setsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (gamesRef.current && !gamesRef.current.contains(e.target)) setGamesOpen(false);
      if (setsRef.current && !setsRef.current.contains(e.target)) setSetsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initialValues?.setId) {
      setSelectedSetLabel(`Set: ${initialValues.setId}`);
    }
  }, [mode, initialValues]);

  async function fetchGames() {
    if (games.length > 0) { setGamesOpen(true); return; }
    setLoadingGames(true);
    try {
      const res = await api.get('/cards/games');
      setGames(res.data);
      setGamesOpen(true);
    } catch {
      // silently fail
    } finally {
      setLoadingGames(false);
    }
  }

  async function fetchSets(gameId) {
    setLoadingSets(true);
    setSets([]);
    try {
      const res = await api.get('/cards/sets', { params: { gameId } });
      setSets(res.data);
      setSetsOpen(true);
    } catch {
      // silently fail
    } finally {
      setLoadingSets(false);
    }
  }

  function handleSelectGame(game) {
    setSelectedGame(game.id);
    setSelectedGameLabel(game.name);
    setGamesOpen(false);
    setSelectedSetLabel(t('card.selectSet'));
    if (setFieldValue) setFieldValue('setId', '');
    fetchSets(game.id);
  }

  function handleSelectSet(set) {
    setSelectedSetLabel(set.name);
    setSetsOpen(false);
    if (setFieldValue) {
      setFieldValue('setId', set.id);
    } else {
      handleChange({ target: { name: 'setId', value: set.id } });
    }
  }

  function handleFile(e) {
    const file = e.target.files[0] || null;
    handleImageChange(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit(onSuccess);
  }

  const isEdit = mode === 'edit';

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate encType="multipart/form-data">
      {submitError && <p className={styles.submitError}>{submitError}</p>}

      {/* Game selector */}
      <div className={styles.field} ref={gamesRef}>
        <label className={styles.label}>{t('card.game')}</label>
        <button
          type="button"
          className={`${styles.dropdownTrigger} ${gamesOpen ? styles.dropdownTriggerOpen : ''}`}
          onClick={fetchGames}
          disabled={loadingGames}
        >
          <span>{loadingGames ? t('common.loadingGames') : selectedGameLabel}</span>
          <svg
            className={`${styles.chevron} ${gamesOpen ? styles.chevronUp : ''}`}
            viewBox="0 0 20 20" fill="currentColor" width="16" height="16"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {gamesOpen && games.length > 0 && (
          <ul className={styles.dropdown}>
            {games.map(game => (
              <li key={game.id}>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${selectedGame === game.id ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSelectGame(game)}
                >
                  {game.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {touched.setId && errors.setId && !values.setId && (
          <span className={styles.error}>{t('inventory.pleaseSelectGameSet')}</span>
        )}
      </div>

      {/* Set selector — only shown after a game is selected */}
      {selectedGame && (
        <div className={styles.field} ref={setsRef}>
          <label className={styles.label}>{t('card.set')}</label>
          <button
            type="button"
            className={`${styles.dropdownTrigger} ${setsOpen ? styles.dropdownTriggerOpen : ''}`}
            onClick={() => {
              if (sets.length > 0) setSetsOpen(o => !o);
              else fetchSets(selectedGame);
            }}
            disabled={loadingSets}
          >
            <span>{loadingSets ? t('common.loadingSets') : selectedSetLabel}</span>
            <svg
              className={`${styles.chevron} ${setsOpen ? styles.chevronUp : ''}`}
              viewBox="0 0 20 20" fill="currentColor" width="16" height="16"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {setsOpen && sets.length > 0 && (
            <ul className={styles.dropdown}>
              {sets.map(set => (
                <li key={set.id}>
                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${values.setId === set.id ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSelectSet(set)}
                  >
                    <span>{set.name}</span>
                    {set.code && <span className={styles.setCode}>{set.code}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Input
        name="name"
        label={t('card.name')}
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name && errors.name}
        placeholder={t('card.namePlaceholder')}
      />

      <Input
        name="cardNumber"
        label={t('card.number')}
        value={values.cardNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.cardNumber && errors.cardNumber}
        placeholder={t('card.numberPlaceholder')}
      />

      <Input
        name="marketPrice"
        label={t('card.marketPrice')}
        type="number"
        value={values.marketPrice}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.marketPrice && errors.marketPrice}
        placeholder={t('card.pricePlaceholder')}
      />

      <Input
        name="attributes"
        label={t('card.attributes')}
        value={values.attributes}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.attributes && errors.attributes}
        placeholder={t('card.attributesPlaceholder')}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rarity">{t('card.rarity')}</label>
        <select
          id="rarity"
          name="rarity"
          value={values.rarity}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.select} ${touched.rarity && errors.rarity ? styles.selectError : ''}`}
        >
          {CARD_RARITIES.map(r => (
            <option key={r} value={r}>{t(`cardRarities.${r.toLowerCase()}`) || r}</option>
          ))}
        </select>
        {touched.rarity && errors.rarity && <span className={styles.error}>{errors.rarity}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('card.image')}</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileRef}
          onChange={handleFile}
          className={styles.fileInput}
          aria-label={t('card.uploadImage')}
        />
        {values.image instanceof File && (
          <img
            src={URL.createObjectURL(values.image)}
            alt={t('card.preview')}
            className={styles.preview}
          />
        )}
        {typeof values.image === 'string' && values.image && (
          <img src={values.image} alt={t('card.currentCard')} className={styles.preview} />
        )}
        {touched.image && errors.image && <span className={styles.error}>{errors.image}</span>}
      </div>

      <Button
        label={isEdit ? t('common.saveChanges') : t('card.create')}
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      />
    </form>
  );
}

CardForm.propTypes = {
  initialValues: PropTypes.object,
  onSuccess: PropTypes.func,
  mode: PropTypes.oneOf(['create', 'edit']),
};

export default CardForm;