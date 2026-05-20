import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import useCatalog from '../../hooks/useCatalog';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardGrid from '../../components/features/cards/CardGrid/CardGrid';
import Modal from '../../components/common/Modal/Modal';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import {
  CARD_RARITIES, CARD_CONDITIONS
} from '../../utils/constants';
import cardService from '../../services/cardService';
import api from '../../services/api';
import { parseApiError } from '../../utils/errors';
import styles from './CatalogPage.module.css';

const EMPTY_ADD_FORM = { condition: 'NEAR_MINT', quantity: 1 };

function CatalogPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const { cards, loading, error, pagination, filters, setFilter, setPage, refetch } = useCatalog();

  // Games y sets para los dropdowns
  const [games, setGames] = useState([]);
  const [sets, setSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addTarget, setAddTarget] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Cargar juegos al montar
  useEffect(() => {
    api.get('/cards/games')
      .then(res => setGames(res.data))
      .catch(() => { });
  }, []);

  // Cargar sets cuando cambia el game seleccionado
  useEffect(() => {
    if (!filters.gameId) {
      setSets([]);
      return;
    }
    setSetsLoading(true);
    api.get('/cards/sets', { params: { gameId: filters.gameId } })
      .then(res => setSets(res.data))
      .catch(() => setSets([]))
      .finally(() => setSetsLoading(false));
  }, [filters.gameId]);

  function handleGameChange(e) {
    const gameId = e.target.value;
    setFilter('gameId', gameId);
    setFilter('setId', '');
  }

  function handleSetChange(e) {
    setFilter('setId', e.target.value);
  }

  async function handleAddToInventory(e) {
    e.preventDefault();
    setAddLoading(true);
    try {
      await cardService.addToInventory(user.id, {
        cardId: addTarget.id,
        condition: addForm.condition,
        quantity: Number(addForm.quantity),
      });
      addToast('success', t('inventory.addedToInventory', { name: addTarget.name }));
      setAddTarget(null);
      setAddForm(EMPTY_ADD_FORM);
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await cardService.deleteCard(deleteTarget.id);
      addToast('success', t('inventory.deletedSuccessfully', { name: deleteTarget.name }));
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('catalog.title')}</h1>
            <p className={styles.subtitle}>{t('catalog.subtitle')}</p>
          </div>
          {isAdmin && (
            <Button label={t('catalog.addCatalogCard')} onClick={() => navigate('/cards/create')} />
          )}
        </div>

        {/* Filtros */}
        <div className={styles.filters}>
          <Input
            name="search"
            placeholder={t('catalog.searchCards')}
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />

          {/* Game */}
          <select
            className={styles.select}
            value={filters.gameId}
            onChange={handleGameChange}
            aria-label={t('catalog.filterByGame')}
          >
            <option value="">{t('catalog.allGames')}</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Set — solo habilitado si hay game */}
          <select
            className={styles.select}
            value={filters.setId}
            onChange={handleSetChange}
            disabled={!filters.gameId || setsLoading}
            aria-label={t('catalog.filterBySet')}
          >
            <option value="">
              {!filters.gameId ? t('inventory.selectGameFirst') : setsLoading ? t('common.loading') : t('catalog.allSets')}
            </option>
            {sets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Rarity — siempre disponible */}
          <select
            className={styles.select}
            value={filters.rarity}
            onChange={e => setFilter('rarity', e.target.value)}
            aria-label={t('catalog.filterByRarity')}
          >
            <option value="">{t('catalog.allRarities')}</option>
            {CARD_RARITIES.map(r => <option key={r} value={r}>{t(`cardRarities.${r.toLowerCase()}`)}</option>)}
          </select>
        </div>

        {/* Chips de filtros activos */}
        {(filters.gameId || filters.setId || filters.rarity || filters.search) && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>{t('common.activeFilters')}</span>
            {filters.search && (
              <span className={styles.chip}>
                "{filters.search}"
                <button onClick={() => setFilter('search', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.gameId && (
              <span className={styles.chip}>
                {games.find(g => g.id === filters.gameId)?.name}
                <button onClick={() => { setFilter('gameId', ''); setFilter('setId', ''); }} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.setId && (
              <span className={styles.chip}>
                {sets.find(s => s.id === filters.setId)?.name}
                <button onClick={() => setFilter('setId', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            {filters.rarity && (
              <span className={styles.chip}>
                {t(`cardRarities.${filters.rarity.toLowerCase()}`)}
                <button onClick={() => setFilter('rarity', '')} className={styles.chipClose}>×</button>
              </span>
            )}
            <button className={styles.clearAll} onClick={() => {
              setFilter('search', '');
              setFilter('gameId', '');
              setFilter('setId', '');
              setFilter('rarity', '');
            }}>
              {t('common.clearAll')}
            </button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <CardGrid
          cards={cards}
          loading={loading}
          emptyMessage={t('inventory.noCardsFound')}
          onAddToInventory={card => setAddTarget(card)}
          onEdit={isAdmin ? card => navigate(`/cards/${card.id}/edit`) : undefined}
          onDelete={isAdmin ? card => setDeleteTarget(card) : undefined}
        />

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label={t('common.previous')} onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} variant="secondary" />
            <span className={styles.pageInfo}>{t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}</span>
            <Button label={t('common.next')} onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} variant="secondary" />
          </div>
        )}
      </div>

      {/* Add to inventory modal */}
      <Modal isOpen={!!addTarget} onClose={() => setAddTarget(null)} title={t('inventory.addCardToInventory', { name: addTarget?.name })}>
        <form onSubmit={handleAddToInventory}>
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.condition')}</label>
            <select
              className={styles.select}
              value={addForm.condition}
              onChange={e => setAddForm(f => ({ ...f, condition: e.target.value }))}
            >
              {CARD_CONDITIONS.map(c => <option key={c} value={c}>{t(`cardConditions.${c.toLowerCase()}`)}</option>)}
            </select>
          </div>
          <Input
            name="quantity"
            label={t('inventory.quantity')}
            type="number"
            value={addForm.quantity}
            onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))}
            min={1}
          />
          <div className={styles.modalActions}>
            <Button label={t('common.cancel')} type="button" onClick={() => setAddTarget(null)} variant="secondary" />
            <Button label={t('inventory.addToInventory')} type="submit" isLoading={addLoading} />
          </div>
        </form>
      </Modal>

      {/* Admin: delete catalog card */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('catalog.deleteCatalogCard')}>
        <p>{t('catalog.deleteCatalogConfirm', { name: deleteTarget?.name })}</p>
        <p className={styles.warning}>{t('inventory.deleteWarning')}</p>
        <div className={styles.modalActions}>
          <Button label={t('common.cancel')} onClick={() => setDeleteTarget(null)} variant="secondary" />
          <Button label={t('common.delete')} onClick={handleDelete} variant="danger" isLoading={deleteLoading} />
        </div>
      </Modal>
    </MainLayout>
  );
}

export default CatalogPage;