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
  CARD_CONDITIONS, CONDITION_LABELS, CARD_RARITIES, RARITY_LABELS
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

// ── Reusable cascade dropdown component ── (sin cambios)
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
        <svg className={`${styles.chevron} ${open ? styles.chevronUp : ''}`} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
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

function InventoryPage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { cards, loading, error, pagination, filters, setFilter, setPage, refetch } = useInventory(user?.id); // ← añadido filters y setFilter
  const isAdmin = user?.role === 'ADMIN';

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [filterGames, setFilterGames] = useState([]);
  const [filterSets, setFilterSets] = useState([]);
  const [filterSetsLoading, setFilterSetsLoading] = useState(false);

  // Cargar juegos al montar para los filtros
  useEffect(() => {
    api.get('/cards/games')
      .then(res => setFilterGames(res.data))
      .catch(() => { });
  }, []);

  // Cargar sets cuando cambia el game en filtros
  useEffect(() => {
    if (!filters.gameId) { setFilterSets([]); return; }
    setFilterSetsLoading(true);
    api.get('/cards/sets', { params: { gameId: filters.gameId } })
      .then(res => setFilterSets(res.data))
      .catch(() => setFilterSets([]))
      .finally(() => setFilterSetsLoading(false));
  }, [filters.gameId]);

  function handleFilterGameChange(e) {
    const gameId = e.target.value;
    setFilter('gameId', gameId);
    setFilter('setId', '');
  }

  // ── Modal: Add from catalog ───────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    } catch { addToast('error', 'Could not load sets'); }
    finally { setSetsLoading(false); }
  }

  async function handleSelectSet(set) {
    setSelectedSet(set);
    setSelectedCard(null);
    setCatalogForm(f => ({ ...f, cardId: '' }));
    setCatalogCardsLoading(true);
    try {
      const res = await api.get(`/cards/set/${set.id}`, { params: { page: 0, size: 100, sortBy: 'cardNumber' } });
      setCatalogCards(res.data.content || res.data);
    } catch { addToast('error', 'Could not load cards for this set'); }
    finally { setCatalogCardsLoading(false); }
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
    } finally { setDeleteLoading(false); }
  }

  async function handleUpdateQuantity(card, newQty) {
    try {
      await cardService.updateCardQuantity(user.id, card.id, newQty);
    } catch (err) {
      addToast('error', parseApiError(err).message);
      throw err;
    }
  }

  async function handleAddFromCatalog(e) {
    e.preventDefault();
    if (!catalogForm.cardId) { addToast('error', 'Please select a card'); return; }
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
    } finally { setCatalogLoading(false); }
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
      if (customForm.image instanceof File) formData.append('image', customForm.image);
      await cardService.addCustomToInventory(user.id, formData);
      addToast('success', 'Custom card added to your inventory!');
      handleCloseCustomModal();
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally { setCustomLoading(false); }
  }

  const hasActiveFilters = filters.search || filters.gameId || filters.setId || filters.rarity || filters.condition;

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Inventory</h1>
          <div className={styles.headerActions}>
            <Button label="Add from Catalog" onClick={() => setShowCatalogModal(true)} variant="secondary" />
            <Button label="Add Custom Card" onClick={() => setShowCustomModal(true)} variant="secondary" />
            {isAdmin && <Button label="Create Catalog Card" onClick={() => navigate('/cards/create')} />}
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className={styles.filters}>
          <Input
            name="search"
            placeholder="Search cards..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
          <select className={styles.select} value={filters.gameId} onChange={handleFilterGameChange} aria-label="Filter by game">
            <option value="">All Games</option>
            {filterGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className={styles.select} value={filters.setId} onChange={e => setFilter('setId', e.target.value)}
            disabled={!filters.gameId || filterSetsLoading} aria-label="Filter by set">
            <option value="">{!filters.gameId ? 'Select a game first' : filterSetsLoading ? 'Loading...' : 'All Sets'}</option>
            {filterSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className={styles.select} value={filters.rarity} onChange={e => setFilter('rarity', e.target.value)} aria-label="Filter by rarity">
            <option value="">All Rarities</option>
            {CARD_RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
          </select>
          <select className={styles.select} value={filters.condition} onChange={e => setFilter('condition', e.target.value)} aria-label="Filter by condition">
            <option value="">All Conditions</option>
            {CARD_CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
          </select>
        </div>

        {/* ── Chips filtros activos ── */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>Active filters:</span>
            {filters.search && (
              <span className={styles.chip}>"{filters.search}"
                <button onClick={() => setFilter('search', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.gameId && (
              <span className={styles.chip}>{filterGames.find(g => g.id === filters.gameId)?.name}
                <button onClick={() => { setFilter('gameId', ''); setFilter('setId', ''); }} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.setId && (
              <span className={styles.chip}>{filterSets.find(s => s.id === filters.setId)?.name}
                <button onClick={() => setFilter('setId', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.rarity && (
              <span className={styles.chip}>{RARITY_LABELS[filters.rarity]}
                <button onClick={() => setFilter('rarity', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.condition && (
              <span className={styles.chip}>{CONDITION_LABELS[filters.condition]}
                <button onClick={() => setFilter('condition', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            <button className={styles.clearAll} onClick={() => {
              setFilter('search', ''); setFilter('gameId', '');
              setFilter('setId', ''); setFilter('rarity', ''); setFilter('condition', '');
            }}>Clear all</button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <CardGrid
          cards={cards}
          loading={loading}
          emptyMessage="No cards in your inventory yet."
          showQuantity
          onDelete={card => setDeleteTarget(card)}
          onUpdateQuantity={handleUpdateQuantity}
        />

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label="Previous" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} variant="secondary" />
            <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
            <Button label="Next" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} variant="secondary" />
          </div>
        )}
      </div>

      {/* Modals sin cambios */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Card">
        <p>Remove <strong>{deleteTarget?.name}</strong> from your inventory?</p>
        <p className={styles.deleteWarning}>Cards in active trades cannot be removed.</p>
        <div className={styles.modalActions}>
          <Button label="Cancel" onClick={() => setDeleteTarget(null)} variant="secondary" />
          <Button label="Remove" onClick={handleRemove} variant="danger" isLoading={deleteLoading} />
        </div>
      </Modal>

      <Modal isOpen={showCatalogModal} onClose={handleCloseCatalogModal} title="Add Card from Catalog">
        <form onSubmit={handleAddFromCatalog}>
          <CascadeDropdown label="Game" options={games} value={selectedGame?.id} onSelect={handleSelectGame} loading={gamesLoading} placeholder="Select a game" />
          <CascadeDropdown label="Set / Collection" options={sets} value={selectedSet?.id} onSelect={handleSelectSet} disabled={!selectedGame} loading={setsLoading} placeholder={selectedGame ? 'Select a set' : 'Select a game first'} />
          <CascadeDropdown label="Card" options={catalogCards} value={selectedCard?.id} onSelect={handleSelectCard} disabled={!selectedSet} loading={catalogCardsLoading} placeholder={selectedSet ? 'Select a card' : 'Select a set first'} />
          <div className={styles.field}>
            <label className={styles.label}>Condition</label>
            <select className={styles.select} value={catalogForm.condition} onChange={e => setCatalogForm(f => ({ ...f, condition: e.target.value }))}>
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
            </select>
          </div>
          <Input name="quantity" label="Quantity" type="number" value={catalogForm.quantity} onChange={e => setCatalogForm(f => ({ ...f, quantity: e.target.value }))} min={1} />
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
            <select className={styles.select} value={customForm.rarity} onChange={e => setCustomForm(f => ({ ...f, rarity: e.target.value }))}>
              {CARD_RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Condition</label>
            <select className={styles.select} value={customForm.condition} onChange={e => setCustomForm(f => ({ ...f, condition: e.target.value }))}>
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
            </select>
          </div>
          <Input name="quantity" label="Quantity" type="number" value={customForm.quantity} onChange={e => setCustomForm(f => ({ ...f, quantity: e.target.value }))} min={1} />
          <div className={styles.field}>
            <label className={styles.label}>Image (optional)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp"
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