import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useCatalog from '../../hooks/useCatalog';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import CardGrid from '../../components/features/cards/CardGrid/CardGrid';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import { CARD_RARITIES, CARD_CONDITIONS, RARITY_LABELS, CONDITION_LABELS } from '../../utils/constants';
import styles from './CatalogPage.module.css';

function CatalogPage() {
  const { user, logout } = useAuth();
  const { cards, loading, error, pagination, filters, setFilter, setPage } = useCatalog();

  const cardsWithOwnership = cards.map(card => ({
    ...card,
    _isOwn: card.userId === user?.id,
  }));

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>Card Catalog</h1>
        <p className={styles.subtitle}>Discover cards from all collectors</p>

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
            {CARD_RARITIES.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
          </select>
          <select
            className={styles.select}
            value={filters.condition}
            onChange={e => setFilter('condition', e.target.value)}
            aria-label="Filter by condition"
          >
            <option value="">All Conditions</option>
            {CARD_CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
          </select>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <CardGrid
          cards={cardsWithOwnership}
          loading={loading}
          showOwner={true}
          emptyMessage="No cards found matching your search."
        />

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button label="Previous" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page <= 1} variant="secondary" />
            <span className={styles.pageInfo}>Page {pagination.page} of {pagination.totalPages}</span>
            <Button label="Next" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} variant="secondary" />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default CatalogPage;
