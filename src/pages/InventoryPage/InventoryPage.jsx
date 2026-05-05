import React, { useState } from 'react';
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
import { CARD_CONDITIONS, CONDITION_LABELS, CARD_RARITIES, RARITY_LABELS } from '../../utils/constants';
import { parseApiError } from '../../utils/errors';
import { validateImageFile } from '../../utils/validators';
import styles from './InventoryPage.module.css';

const EMPTY_CATALOG_FORM = { cardId: '', condition: 'NEAR_MINT', quantity: 1 };
const EMPTY_CUSTOM_FORM = { name: '', rarity: 'COMMON', condition: 'NEAR_MINT', quantity: 1, image: null };

function InventoryPage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { cards, loading, error, pagination, setPage, refetch } = useInventory(user?.id);
  const isAdmin = user?.role === 'ADMIN';

  // Remove from inventory
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add catalog card to inventory
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogForm, setCatalogForm] = useState(EMPTY_CATALOG_FORM);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Add custom card to inventory
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM_FORM);
  const [customLoading, setCustomLoading] = useState(false);

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
    setCatalogLoading(true);
    try {
      await cardService.addToInventory(user.id, {
        cardId: catalogForm.cardId.trim(),
        condition: catalogForm.condition,
        quantity: Number(catalogForm.quantity),
      });
      addToast('success', 'Card added to your inventory!');
      setShowCatalogModal(false);
      setCatalogForm(EMPTY_CATALOG_FORM);
      refetch();
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setCatalogLoading(false);
    }
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
      };
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }), 'data.json');
      if (customForm.image instanceof File) {
        formData.append('image', customForm.image);
      }
      await cardService.addCustomToInventory(user.id, formData);
      addToast('success', 'Custom card added to your inventory!');
      setShowCustomModal(false);
      setCustomForm(EMPTY_CUSTOM_FORM);
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
      <Modal isOpen={showCatalogModal} onClose={() => setShowCatalogModal(false)} title="Add Card from Catalog">
        <form onSubmit={handleAddFromCatalog}>
          <Input
            name="cardId"
            label="Card ID (from catalog)"
            value={catalogForm.cardId}
            onChange={e => setCatalogForm(f => ({ ...f, cardId: e.target.value }))}
            placeholder="Paste the card UUID from the catalog"
            required
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
            <Button label="Cancel" type="button" onClick={() => setShowCatalogModal(false)} variant="secondary" />
            <Button label="Add to Inventory" type="submit" isLoading={catalogLoading} />
          </div>
        </form>
      </Modal>

      {/* Add custom card */}
      <Modal isOpen={showCustomModal} onClose={() => setShowCustomModal(false)} title="Add Custom Card">
        <form onSubmit={handleAddCustom}>
          <Input
            name="name"
            label="Card Name"
            value={customForm.name}
            onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
            placeholder="My custom card"
            required
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
            <Button label="Cancel" type="button" onClick={() => setShowCustomModal(false)} variant="secondary" />
            <Button label="Add Custom Card" type="submit" isLoading={customLoading} />
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default InventoryPage;
