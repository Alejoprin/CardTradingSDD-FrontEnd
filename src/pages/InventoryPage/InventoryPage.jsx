import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CARD_CONDITIONS, CARD_RARITIES
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

// ── Reusable cascade dropdown component ──
function CascadeDropdown({ label, options, value, onSelect, disabled, loading, placeholder }) {
  const { t } = useTranslation();
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
          {loading ? t('common.loading') : (selected?.name || placeholder)}
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
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { cards, loading, error, pagination, filters, setFilter, setPage, refetch } = useInventory(user?.id);
  const appliedStateRef = useRef(false);
  const pendingFiltersRef = useRef(null);

  // Step 1 — read location.state once on mount
  useEffect(() => {
    if (appliedStateRef.current) return;
    const { gameName, setName } = location.state || {};
    if (!gameName) return;
    appliedStateRef.current = true;
    pendingFiltersRef.current = { gameName, setName: setName || null };
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

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

  // Step 2 — resolve gameName → gameId once filterGames loads
  useEffect(() => {
    if (!pendingFiltersRef.current?.gameName || filterGames.length === 0) return;
    const game = filterGames.find(g => g.name === pendingFiltersRef.current.gameName);
    if (game) {
      const setName = pendingFiltersRef.current.setName;
      pendingFiltersRef.current = setName ? { setName } : null;
      setFilter('gameId', String(game.id));
    } else {
      pendingFiltersRef.current = null;
    }
  }, [filterGames, setFilter]);

  // Step 3 — resolve setName → setId once filterSets loads
  useEffect(() => {
    if (!pendingFiltersRef.current?.setName || filterSets.length === 0) return;
    const set = filterSets.find(s => s.name === pendingFiltersRef.current.setName);
    if (set) setFilter('setId', String(set.id));
    pendingFiltersRef.current = null;
  }, [filterSets, setFilter]);

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
      .catch(() => addToast('error', t('inventory.couldNotLoadGames')))
      .finally(() => setGamesLoading(false));
  }, [showCatalogModal]);

  // Load games when custom modal opens
  useEffect(() => {
    if (!showCustomModal) return;
    setCustomGamesLoading(true);
    api.get('/cards/games')
      .then(res => setCustomGames(res.data))
      .catch(() => addToast('error', t('inventory.couldNotLoadGames')))
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
    } catch { addToast('error', t('inventory.couldNotLoadSets')); }
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
    } catch { addToast('error', t('inventory.couldNotLoadCards')); }
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
      addToast('success', t('inventory.removedFromInventory', { name: deleteTarget.name }));
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
    if (!catalogForm.cardId) { addToast('error', t('inventory.selectCardError')); return; }
    setCatalogLoading(true);
    try {
      await cardService.addToInventory(user.id, {
        cardId: catalogForm.cardId,
        condition: catalogForm.condition,
        quantity: Number(catalogForm.quantity),
      });
      addToast('success', t('inventory.cardAdded'));
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
      addToast('error', t('inventory.couldNotLoadSets'));
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
      addToast('success', t('inventory.customCardAdded'));
      handleCloseCustomModal();
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally { setCustomLoading(false); }
  }

  // ── Full Set view ────────────────────────────────────────────────────────
  const [showFullSet, setShowFullSet] = useState(false);
  const [allSetCards, setAllSetCards] = useState([]);
  const [allSetCardsLoading, setAllSetCardsLoading] = useState(false);
  const [allSetError, setAllSetError] = useState(null);

  // Reset when the selected set changes
  useEffect(() => {
    setShowFullSet(false);
    setAllSetCards([]);
    setAllSetError(null);
  }, [filters.setId]);

  // Fetch all cards in the set when Full Set mode is on
  useEffect(() => {
    if (!showFullSet || !filters.setId) return;
    setAllSetCardsLoading(true);
    setAllSetError(null);
    api.get('/cards', { params: { setId: filters.setId, ...(filters.gameId ? { gameId: filters.gameId } : {}), page: 0, size: 500 } })
      .then(res => {
        const arr = Array.isArray(res.data?.content) ? res.data.content
          : Array.isArray(res.data) ? res.data
            : [];
        setAllSetCards(arr);
      })
      .catch(() => {
        setAllSetError(t('inventory.couldNotLoadFullSet'));
        setAllSetCards([]);
      })
      .finally(() => setAllSetCardsLoading(false));
  }, [showFullSet, filters.setId, filters.gameId, t]);

  // Merge set cards with owned inventory for the Full Set view
  const displayCards = useMemo(() => {
    if (!showFullSet || !filters.setId || !Array.isArray(allSetCards) || allSetCards.length === 0) return cards;
    const ownedMap = new Map();
    cards.forEach(c => {
      const key = c.cardId ?? c.id;
      if (key != null) ownedMap.set(String(key), c);
    });
    const merged = allSetCards.map(setCard => {
      const key = String(setCard.id ?? setCard.cardId ?? '');
      const ownedCard = ownedMap.get(key);
      if (ownedCard) return { ...ownedCard, owned: true };
      return { ...setCard, name: setCard.name || setCard.cardName, owned: false };
    });
    return merged.sort((a, b) => (b.owned === true ? 1 : 0) - (a.owned === true ? 1 : 0));
  }, [showFullSet, filters.setId, allSetCards, cards]);

  const hasActiveFilters = filters.search || filters.gameId || filters.setId || filters.rarity || filters.condition;

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('inventory.title')}</h1>
          <div className={styles.headerActions}>
            <Button label={t('inventory.addFromCatalog')} onClick={() => setShowCatalogModal(true)} variant="secondary" />
            <Button label={t('inventory.addCustomCard')} onClick={() => setShowCustomModal(true)} variant="secondary" />
            {isAdmin && <Button label={t('inventory.createCatalogCard')} onClick={() => navigate('/cards/create')} />}
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className={styles.filters}>
          <Input
            name="search"
            placeholder={t('inventory.searchCards')}
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
          <select className={styles.select} value={filters.gameId} onChange={handleFilterGameChange} aria-label={t('inventory.filterByGame')}>
            <option value="">{t('inventory.allGames')}</option>
            {filterGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className={styles.select} value={filters.setId} onChange={e => setFilter('setId', e.target.value)}
            disabled={!filters.gameId || filterSetsLoading} aria-label={t('inventory.filterBySet')}>
            <option value="">{!filters.gameId ? t('inventory.selectGameFirst') : filterSetsLoading ? t('common.loading') : t('inventory.allSets')}</option>
            {filterSets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className={styles.select} value={filters.rarity} onChange={e => setFilter('rarity', e.target.value)} aria-label={t('inventory.filterByRarity')}>
            <option value="">{t('inventory.allRarities')}</option>
            {CARD_RARITIES.map(r => <option key={r} value={r}>{t(`cardRarities.${r.toLowerCase()}`)}</option>)}
          </select>
          <select className={styles.select} value={filters.condition} onChange={e => setFilter('condition', e.target.value)} aria-label={t('inventory.filterByCondition')}>
            <option value="">{t('inventory.allConditions')}</option>
            {CARD_CONDITIONS.map(c => <option key={c} value={c}>{t(`cardConditions.${c.toLowerCase()}`)}</option>)}
          </select>
        </div>

        {/* ── Chips filtros activos ── */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>{t('common.activeFilters')}</span>
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
              <span className={styles.chip}>{t(`cardRarities.${filters.rarity.toLowerCase()}`)}
                <button onClick={() => setFilter('rarity', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.condition && (
              <span className={styles.chip}>{t(`cardConditions.${filters.condition.toLowerCase()}`)}
                <button onClick={() => setFilter('condition', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            <button className={styles.clearAll} onClick={() => {
              setFilter('search', ''); setFilter('gameId', '');
              setFilter('setId', ''); setFilter('rarity', ''); setFilter('condition', '');
            }}>{t('common.clearAll')}</button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {allSetError && <p className={styles.error}>{allSetError}</p>}

        {filters.setId && (
          <div className={styles.viewToggle}>
            <span className={styles.viewToggleLabel}>{t('inventory.show')}:</span>
            <div className={styles.viewToggleBtns}>
              <button
                className={`${styles.toggleBtn} ${!showFullSet ? styles.toggleBtnActive : ''}`}
                onClick={() => setShowFullSet(false)}
              >
                {t('inventory.myCards')}
              </button>
              <button
                className={`${styles.toggleBtn} ${showFullSet ? styles.toggleBtnActive : ''}`}
                onClick={() => setShowFullSet(true)}
              >
                {t('inventory.fullSet')}{allSetCards.length > 0 ? ` (${allSetCards.length})` : ''}
              </button>
            </div>
          </div>
        )}

        <CardGrid
          cards={displayCards}
          loading={showFullSet ? allSetCardsLoading : loading}
          emptyMessage={t('inventory.noCards')}
          showQuantity={!showFullSet}
          onDelete={showFullSet ? undefined : card => setDeleteTarget(card)}
          onUpdateQuantity={showFullSet ? undefined : handleUpdateQuantity}
        />

        {!showFullSet && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label={t('common.previous')} onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} variant="secondary" />
            <span className={styles.pageInfo}>{t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}</span>
            <Button label={t('common.next')} onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} variant="secondary" />
          </div>
        )}
      </div>

      {/* Remove card modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('inventory.removeCard')}>
        <p>{t('inventory.removeCardConfirm', { name: deleteTarget?.name })}</p>
        <p className={styles.deleteWarning}>{t('inventory.deleteWarning')}</p>
        <div className={styles.modalActions}>
          <Button label={t('common.cancel')} onClick={() => setDeleteTarget(null)} variant="secondary" />
          <Button label={t('common.remove')} onClick={handleRemove} variant="danger" isLoading={deleteLoading} />
        </div>
      </Modal>

      {/* Add from catalog modal */}
      <Modal isOpen={showCatalogModal} onClose={handleCloseCatalogModal} title={t('inventory.addCardFromCatalog')}>
        <form onSubmit={handleAddFromCatalog}>
          <CascadeDropdown label={t('inventory.game')} options={games} value={selectedGame?.id} onSelect={handleSelectGame} loading={gamesLoading} placeholder={t('inventory.selectGame')} />
          <CascadeDropdown label={t('inventory.set')} options={sets} value={selectedSet?.id} onSelect={handleSelectSet} disabled={!selectedGame} loading={setsLoading} placeholder={selectedGame ? t('inventory.selectSet') : t('inventory.selectGameFirst')} />
          <CascadeDropdown label={t('inventory.card')} options={catalogCards} value={selectedCard?.id} onSelect={handleSelectCard} disabled={!selectedSet} loading={catalogCardsLoading} placeholder={selectedSet ? t('inventory.selectCard') : t('inventory.selectSetFirst')} />
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.condition')}</label>
            <select className={styles.select} value={catalogForm.condition} onChange={e => setCatalogForm(f => ({ ...f, condition: e.target.value }))}>
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{t(`cardConditions.${c.toLowerCase()}`)}</option>)}
            </select>
          </div>
          <Input name="quantity" label={t('inventory.quantity')} type="number" value={catalogForm.quantity} onChange={e => setCatalogForm(f => ({ ...f, quantity: e.target.value }))} min={1} />
          <div className={styles.modalActions}>
            <Button label={t('common.cancel')} type="button" onClick={handleCloseCatalogModal} variant="secondary" />
            <Button label={t('catalog.addToInventory')} type="submit" isLoading={catalogLoading} disabled={!catalogForm.cardId} />
          </div>
        </form>
      </Modal>

      {/* Add custom card modal */}
      <Modal isOpen={showCustomModal} onClose={handleCloseCustomModal} title={t('inventory.addCustomCard')}>
        <form onSubmit={handleAddCustom}>
          <CascadeDropdown
            label={t('inventory.gameOptional')}
            options={customGames}
            value={customSelectedGame?.id}
            onSelect={handleCustomSelectGame}
            loading={customGamesLoading}
            placeholder={t('inventory.selectGame')}
          />

          <CascadeDropdown
            label={t('inventory.setOptional')}
            options={customSets}
            value={customSelectedSet?.id}
            onSelect={handleCustomSelectSet}
            disabled={!customSelectedGame}
            loading={customSetsLoading}
            placeholder={customSelectedGame ? t('inventory.selectSet') : t('inventory.selectGameFirst')}
          />

          <Input
            name="name"
            label={t('inventory.cardName')}
            value={customForm.name}
            onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t('inventory.cardNamePlaceholder')}
          />

          <Input
            name="cardNumber"
            label={t('inventory.cardNumber')}
            value={customForm.cardNumber}
            onChange={e => setCustomForm(f => ({ ...f, cardNumber: e.target.value }))}
            placeholder={t('inventory.cardNumberPlaceholder')}
          />
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.rarity')}</label>
            <select className={styles.select} value={customForm.rarity} onChange={e => setCustomForm(f => ({ ...f, rarity: e.target.value }))}>
              {CARD_RARITIES.map(r => <option key={r} value={r}>{t(`cardRarities.${r.toLowerCase()}`)}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.condition')}</label>
            <select className={styles.select} value={customForm.condition} onChange={e => setCustomForm(f => ({ ...f, condition: e.target.value }))}>
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{t(`cardConditions.${c.toLowerCase()}`)}</option>)}
            </select>
          </div>
          <Input name="quantity" label={t('inventory.quantity')} type="number" value={customForm.quantity} onChange={e => setCustomForm(f => ({ ...f, quantity: e.target.value }))} min={1} />
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.imageOptional')}</label>
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
            <Button label={t('common.cancel')} type="button" onClick={handleCloseCustomModal} variant="secondary" />
            <Button label={t('inventory.addCustomCard')} type="submit" isLoading={customLoading} />
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default InventoryPage;
