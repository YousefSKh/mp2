import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResults } from '../context/ResultsContext';
import type { NasaItem } from '../types/nasa';
import { formatDate } from '../utils/format';
import styles from './ListView.module.css';

type SortKey = 'title' | 'date' | 'center';
type Order = 'asc' | 'desc';

const SORT_LABELS: Record<SortKey, string> = {
  title: 'Title',
  date: 'Date taken',
  center: 'NASA center',
};

function isSortKey(value: string | null): value is SortKey {
  return value === 'title' || value === 'date' || value === 'center';
}

function compare(a: NasaItem, b: NasaItem, key: SortKey): number {
  switch (key) {
    case 'title':
      return a.title.localeCompare(b.title);
    case 'date':
      return a.dateCreated.localeCompare(b.dateCreated);
    case 'center':
      return a.center.localeCompare(b.center) || a.title.localeCompare(b.title);
  }
}

export default function ListView() {
  const { items, setNavIds } = useResults();
  const [params, setParams] = useSearchParams();

  // Search state lives in the URL so the back button restores it
  const query = params.get('q') ?? '';
  const sortParam = params.get('sort');
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'title';
  const order: Order = params.get('order') === 'desc' ? 'desc' : 'asc';

  const update = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.toLowerCase().includes(q))
        )
      : items;
    const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey));
    return order === 'asc' ? sorted : sorted.reverse();
  }, [items, query, sortKey, order]);

  const rememberOrder = () => setNavIds(results.map((r) => r.nasaId));

  return (
    <section>
      <h1 className={styles.heading}>Search the archive</h1>

      <div className={styles.controls}>
        <label className={styles.field}>
          <span className={styles.label}>Search by title or keyword</span>
          <input
            type="search"
            className={styles.input}
            value={query}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Try moon, Curiosity, or Hubble"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Sort by</span>
          <select
            className={styles.input}
            value={sortKey}
            onChange={(e) => update('sort', e.target.value)}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.field} role="group" aria-label="Sort order">
          <span className={styles.label}>Order</span>
          <div className={styles.toggle}>
            {(['asc', 'desc'] as Order[]).map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={order === o}
                className={order === o ? `${styles.toggleButton} ${styles.toggleActive}` : styles.toggleButton}
                onClick={() => update('order', o === 'asc' ? '' : 'desc')}
              >
                {o === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        {results.length} of {items.length} images
      </p>

      {results.length === 0 ? (
        <p className={styles.empty}>
          No images match "{query}". Try a broader word like Mars or Apollo.
        </p>
      ) : (
        <ul className={styles.list}>
          {results.map((item) => (
            <li key={item.nasaId}>
              <Link
                to={`/item/${encodeURIComponent(item.nasaId)}`}
                className={styles.row}
                onClick={rememberOrder}
              >
                <img src={item.thumbnail} alt="" loading="lazy" className={styles.thumb} />
                <span className={styles.title}>{item.title}</span>
                <span className={styles.meta}>{formatDate(item.dateCreated)}</span>
                <span className={styles.meta}>{item.center}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
