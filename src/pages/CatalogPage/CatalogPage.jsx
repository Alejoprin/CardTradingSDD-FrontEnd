import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import useCatalog from '../../hooks/useCatalog';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardGrid from
  '../../components/features/cards/CardGrid/CardGrid';
import Modal from '../../components/common/Modal/Modal';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import {
  CARD_RARITIES, RARITY_LABELS, CARD_CONDITIONS,
  CONDITION_LABELS
} from '../../utils/constants';
import cardService from '../../services/cardService';
import { parseApiError } from '../../utils/errors';
import styles from './CatalogPage.module.css';
const EMPTY_ADD_FORM = { condition: 'NEAR_MINT', quantity: 1 };
function CatalogPage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();

  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const { cards, loading, error, pagination, filters, setFilter,
    setPage, refetch } = useCatalog();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addTarget, setAddTarget] = useState(null);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  async function handleAddToInventory(e) {
    e.preventDefault();
    setAddLoading(true);
    try {
      await cardService.addToInventory(user.id, {
        cardId: addTarget.id,
        condition: addForm.condition,
        quantity: Number(addForm.quantity),
      });
      addToast('success', `"${addTarget.name}" added to your
inventory!`);
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
      addToast('success', `"${deleteTarget.name}" deleted
successfully`);
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
            <h1 className={styles.title}>Card Catalog</h1>
            <p className={styles.subtitle}>Browse all available
              cards</p>
          </div>
          {isAdmin && (
            <Button label="Add Catalog Card" onClick={() =>
              navigate('/cards/create')} />
          )}
        </div>
        <div className={styles.filters}>
          <Input
            name="search"
            placeholder="Search cards..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
          <select
            className={styles.select}
            value={filters.rarity}
            onChange={e => setFilter('rarity', e.target.value)}
            aria-label="Filter by rarity"
          >
            <option value="">All Rarities</option>
            {CARD_RARITIES.map(r => <option key={r}
              value={r}>{RARITY_LABELS[r]}</option>)}
          </select>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <CardGrid
          cards={cards}
          loading={loading}

          emptyMessage="No cards found matching your search."
          onAddToInventory={card => setAddTarget(card)}
          onEdit={isAdmin ? card => navigate(`/cards/${card.id}/edit`)
            : undefined}
          onDelete={isAdmin ? card => setDeleteTarget(card) :
            undefined}
        />
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label="Previous" onClick={() =>
              setPage(pagination.page - 1)} disabled={pagination.page <= 1}
              variant="secondary" />
            <span className={styles.pageInfo}>Page {pagination.page} of
              {pagination.totalPages}</span>
            <Button label="Next" onClick={() => setPage(pagination.page
              + 1)} disabled={pagination.page >= pagination.totalPages}
              variant="secondary" />
          </div>
        )}
      </div>
      {/* Add to inventory modal */}
      <Modal isOpen={!!addTarget} onClose={() => setAddTarget(null)}
        title={`Add "${addTarget?.name}" to Inventory`}>
        <form onSubmit={handleAddToInventory}>
          <div className={styles.field}>
            <label className={styles.label}>Condition</label>
            <select
              className={styles.select}
              value={addForm.condition}
              onChange={e => setAddForm(f => ({
                ...f, condition:
                  e.target.value
              }))}
            >
              {CARD_CONDITIONS.map(c => <option key={c}
                value={c}>{CONDITION_LABELS[c]}</option>)}
            </select>
          </div>
          <Input
            name="quantity"
            label="Quantity"
            type="number"
            value={addForm.quantity}

            onChange={e => setAddForm(f => ({
              ...f, quantity:
                e.target.value
            }))}
            min={1}
          />
          <div className={styles.modalActions}>
            <Button label="Cancel" type="button" onClick={() =>
              setAddTarget(null)} variant="secondary" />
            <Button label="Add to Inventory" type="submit"
              isLoading={addLoading} />
          </div>
        </form>
      </Modal>
      {/* Admin: delete catalog card */}
      <Modal isOpen={!!deleteTarget} onClose={() =>
        setDeleteTarget(null)} title="Delete Catalog Card">
        <p>Permanently delete <strong>{deleteTarget?.name}</strong>
          from the catalog?</p>
        <p className={styles.warning}>This will also remove it from all
          user inventories.</p>
        <div className={styles.modalActions}>
          <Button label="Cancel" onClick={() => setDeleteTarget(null)}
            variant="secondary" />
          <Button label="Delete" onClick={handleDelete}
            variant="danger" isLoading={deleteLoading} />
        </div>
      </Modal>
    </MainLayout>
  );
}
export default CatalogPage;