import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import useInventory from '../../hooks/useInventory';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardGrid from '../../components/features/cards/CardGrid/CardGrid';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import Input from '../../components/common/Input/Input';
import cardService from '../../services/cardService';
import api from '../../services/api';
import {
  CARD_CONDITIONS, CONDITION_LABELS, CARD_RARITIES,
  RARITY_LABELS
} from '../../utils/constants';
import { parseApiError } from '../../utils/errors';
import { validateImageFile } from '../../utils/validators';
import styles from './InventoryPage.module.css';

const EMPTY_CATALOG_FORM = {
  cardId: '', condition: 'NEAR_MINT', quantity: 1
};
const EMPTY_CUSTOM_FORM = {
  name: '', cardNumber: '', rarity: 'COMMON', condition: 'NEAR_MINT', quantity: 1, setId: '', image: null
};

// ── Reusable cascade dropdown component ──────────────────────────────────────
function CascadeDropdown({ label, options, value, onSelect, disabled, loading, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.id === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.field} ref={ref}>
      <label className={styles.label}>{label}</label>
      <button
        type="button"
        className={`${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ''} ${disabled ? styles.dropdownTriggerDisabled : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled || loading}
      >
        <span className={selected ? styles.dropdownSelected : styles.dropdownPlaceholder}>
          {loading ? 'Loading…' : (selected?.name || placeholder)}
        </span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}
          viewBox="0 0 20 20" fill="currentColor" width="16" height="16"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && options.length > 0 && (
        <ul className={styles.dropdown}>
          {options.map(opt => (
            <li key={opt.id}>
              <button
                type="button"
                className={`${styles.dropdownItem} ${value === opt.id ? styles.dropdownItemActive : ''}`}
                onClick={() => { onSelect(opt); setOpen(false); }}
              >
                <span>{opt.name}</span>
                {opt.code && <span className={styles.setCode}>{opt.code}</span>}
                {opt.cardNumber && <span className={styles.setCode}>#{opt.cardNumber}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function InventoryPage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { cards, loading, error, pagination, setPage, refetch } = useInventory(user?.id);
  const isAdmin = user?.role === 'ADMIN';

  // Remove from inventory
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add catalog card — cascade state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogForm, setCatalogForm] = useState(EMPTY_CATALOG_FORM);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const [sets, setSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  const [catalogCards, setCatalogCards] = useState([]);
  const [catalogCardsLoading, setCatalogCardsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Add custom card
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM_FORM);
  const [customLoading, setCustomLoading] = useState(false);

  const [customGames, setCustomGames] = useState([]);
  const [customGamesLoading, setCustomGamesLoading] = useState(false);
  const [customSelectedGame, setCustomSelectedGame] = useState(null);
  const [customSets, setCustomSets] = useState([]);
  const [customSetsLoading, setCustomSetsLoading] = useState(false);
  const [customSelectedSet, setCustomSelectedSet] = useState(null);

  // Load games when catalog modal opens
  useEffect(() => {
    if (!showCatalogModal) return;
    setGamesLoading(true);
    api.get('/cards/games')
      .then(res => setGames(res.data))
      .catch(() => addToast('error', 'Could not load games'))
      .finally(() => setGamesLoading(false));
  }, [showCatalogModal]);

  // Load games when custom modal opens
  useEffect(() => {
    if (!showCustomModal) return;
    setCustomGamesLoading(true);
    api.get('/cards/games')
      .then(res => setCustomGames(res.data))
      .catch(() => addToast('error', 'Could not load games'))
      .finally(() => setCustomGamesLoading(false));
  }, [showCustomModal]);

  function handleCloseCatalogModal() {
    setShowCatalogModal(false);
    setCatalogForm(EMPTY_CATALOG_FORM);
    setSelectedGame(null);
    setSelectedSet(null);
    setSelectedCard(null);
    setSets([]);
    setCatalogCards([]);
  }

  async function handleSelectGame(game) {
    setSelectedGame(game);
    setSelectedSet(null);
    setSelectedCard(null);
    setCatalogForm(f => ({ ...f, cardId: '' }));
    setCatalogCards([]);
    setSetsLoading(true);
    try {
      const res = await api.get('/cards/sets', { params: { gameId: game.id } });
      setSets(res.data);
    } catch {
      addToast('error', 'Could not load sets');
    } finally {
      setSetsLoading(false);
    }
  }

  async function handleSelectSet(set) {
    setSelectedSet(set);
    setSelectedCard(null);
    setCatalogForm(f => ({ ...f, cardId: '' }));
    setCatalogCardsLoading(true);
    try {
      const res = await api.get(`/cards/set/${set.id}`, {
        params: { page: 0, size: 100, sortBy: 'cardNumber' }
      });
      // API returns Page<CardDetailResponse>, extract content
      setCatalogCards(res.data.content || res.data);
    } catch {
      addToast('error', 'Could not load cards for this set');
    } finally {
      setCatalogCardsLoading(false);
    }
  }

  function handleSelectCard(card) {
    setSelectedCard(card);
    setCatalogForm(f => ({ ...f, cardId: card.id }));
  }

  async function handleRemove() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await cardService.removeFromInventory(user.id, deleteTarget.id);
      addToast('success', `"${deleteTarget.name}" removed from inventory`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleAddFromCatalog(e) {
    e.preventDefault();
    if (!catalogForm.cardId) {
      addToast('error', 'Please select a card');
      return;
    }
    setCatalogLoading(true);
    try {
      await cardService.addToInventory(user.id, {
        cardId: catalogForm.cardId,
        condition: catalogForm.condition,
        quantity: Number(catalogForm.quantity),
      });
      addToast('success', 'Card added to your inventory!');
      handleCloseCatalogModal();
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setCatalogLoading(false);
    }
  }

  async function handleCustomSelectGame(game) {
    setCustomSelectedGame(game);
    setCustomSelectedSet(null);
    setCustomForm(f => ({ ...f, setId: '' }));
    setCustomSetsLoading(true);
    try {
      const res = await api.get('/cards/sets', { params: { gameId: game.id } });
      setCustomSets(res.data);
    } catch {
      addToast('error', 'Could not load sets');
    } finally {
      setCustomSetsLoading(false);
    }
  }

  function handleCustomSelectSet(set) {
    setCustomSelectedSet(set);
    setCustomForm(f => ({ ...f, setId: set.id }));
  }

  function handleCloseCustomModal() {
    setShowCustomModal(false);
    setCustomForm(EMPTY_CUSTOM_FORM);
    setCustomSelectedGame(null);
    setCustomSelectedSet(null);
    setCustomSets([]);
  }

  async function handleAddCustom(e) {
    e.preventDefault();
    setCustomLoading(true);
    try {
      const formData = new FormData();
      const data = {
        name: customForm.name,
        rarity: customForm.rarity,
        condition: customForm.condition,
        quantity: Number(customForm.quantity),
        ...(customForm.cardNumber && { cardNumber: customForm.cardNumber }),
        ...(customForm.setId && { setId: customForm.setId }),
      };
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }), 'data.json');
      if (customForm.image instanceof File) {
        formData.append('image', customForm.image);
      }
      await cardService.addCustomToInventory(user.id, formData);
      addToast('success', 'Custom card added to your inventory!');
      handleCloseCustomModal();
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setCustomLoading(false);
    }
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Inventory</h1>
          <div className={styles.headerActions}>
            <Button label="Add from Catalog" onClick={() => setShowCatalogModal(true)} variant="secondary" />
            <Button label="Add Custom Card" onClick={() => setShowCustomModal(true)} variant="secondary" />
            {isAdmin && (
              <Button label="Create Catalog Card" onClick={() => navigate('/cards/create')} />
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <CardGrid
          cards={cards}
          loading={loading}
          emptyMessage="No cards in your inventory yet."
          showQuantity
          onDelete={card => setDeleteTarget(card)}
        />

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label="Previous" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} variant="secondary" />
            <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
            <Button label="Next" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} variant="secondary" />
          </div>
        )}
      </div>

      {/* Remove from inventory */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Card">
        <p>Remove <strong>{deleteTarget?.name}</strong> from your inventory?</p>
        <p className={styles.deleteWarning}>Cards in active trades cannot be removed.</p>
        <div className={styles.modalActions}>
          <Button label="Cancel" onClick={() => setDeleteTarget(null)} variant="secondary" />
          <Button label="Remove" onClick={handleRemove} variant="danger" isLoading={deleteLoading} />
        </div>
      </Modal>

      {/* Add from catalog */}
      <Modal isOpen={showCatalogModal} onClose={handleCloseCatalogModal} title="Add Card from Catalog">
        <form onSubmit={handleAddFromCatalog}>

          {/* 1. Game */}
          <CascadeDropdown
            label="Game"
            options={games}
            value={selectedGame?.id}
            onSelect={handleSelectGame}
            loading={gamesLoading}
            placeholder="Select a game"
          />

          {/* 2. Set — enabled after game selected */}
          <CascadeDropdown
            label="Set / Collection"
            options={sets}
            value={selectedSet?.id}
            onSelect={handleSelectSet}
            disabled={!selectedGame}
            loading={setsLoading}
            placeholder={selectedGame ? 'Select a set' : 'Select a game first'}
          />

          {/* 3. Card — enabled after set selected */}
          <CascadeDropdown
            label="Card"
            options={catalogCards}
            value={selectedCard?.id}
            onSelect={handleSelectCard}
            disabled={!selectedSet}
            loading={catalogCardsLoading}
            placeholder={selectedSet ? 'Select a card' : 'Select a set first'}
          />

          <div className={styles.field}>
            <label className={styles.label}>Condition</label>
            <select
              className={styles.select}
              value={catalogForm.condition}
              onChange={e => setCatalogForm(f => ({ ...f, condition: e.target.value }))}
            >
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
            </select>
          </div>

          <Input
            name="quantity"
            label="Quantity"
            type="number"
            value={catalogForm.quantity}
            onChange={e => setCatalogForm(f => ({ ...f, quantity: e.target.value }))}
            min={1}
          />

          <div className={styles.modalActions}>
            <Button label="Cancel" type="button" onClick={handleCloseCatalogModal} variant="secondary" />
            <Button label="Add to Inventory" type="submit" isLoading={catalogLoading} disabled={!catalogForm.cardId} />
          </div>
        </form>
      </Modal>

      {/* Add custom card */}
      <Modal isOpen={showCustomModal} onClose={handleCloseCustomModal} title="Add Custom Card">
        <form onSubmit={handleAddCustom}>
          <CascadeDropdown
            label="Game (optional)"
            options={customGames}
            value={customSelectedGame?.id}
            onSelect={handleCustomSelectGame}
            loading={customGamesLoading}
            placeholder="Select a game"
          />

          <CascadeDropdown
            label="Set / Collection (optional)"
            options={customSets}
            value={customSelectedSet?.id}
            onSelect={handleCustomSelectSet}
            disabled={!customSelectedGame}
            loading={customSetsLoading}
            placeholder={customSelectedGame ? 'Select a set' : 'Select a game first'}
          />

          <Input
            name="name"
            label="Card Name"
            value={customForm.name}
            onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
            placeholder="My custom card"
          />

          <Input
            name="cardNumber"
            label="Card Number (optional)"
            value={customForm.cardNumber}
            onChange={e => setCustomForm(f => ({ ...f, cardNumber: e.target.value }))}
            placeholder="e.g. 4/102"
          />
          <div className={styles.field}>
            <label className={styles.label}>Rarity</label>
            <select
              className={styles.select}
              value={customForm.rarity}
              onChange={e => setCustomForm(f => ({ ...f, rarity: e.target.value }))}
            >
              {CARD_RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Condition</label>
            <select
              className={styles.select}
              value={customForm.condition}
              onChange={e => setCustomForm(f => ({ ...f, condition: e.target.value }))}
            >
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
            </select>
          </div>
          <Input
            name="quantity"
            label="Quantity"
            type="number"
            value={customForm.quantity}
            onChange={e => setCustomForm(f => ({ ...f, quantity: e.target.value }))}
            min={1}
          />
          <div className={styles.field}>
            <label className={styles.label}>Image (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => {
                const file = e.target.files[0] || null;
                const imgErr = file ? validateImageFile(file) : null;
                if (imgErr) { addToast('error', imgErr); e.target.value = ''; return; }
                setCustomForm(f => ({ ...f, image: file }));
              }}
              className={styles.fileInput}
            />
          </div>
          <div className={styles.modalActions}>
            <Button label="Cancel" type="button" onClick={handleCloseCustomModal} variant="secondary" />
            <Button label="Add Custom Card" type="submit" isLoading={customLoading} />
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default InventoryPage;