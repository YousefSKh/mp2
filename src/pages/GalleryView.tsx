import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TOPICS } from '../api/nasa';
import { useResults } from '../context/ResultsContext';
import styles from './GalleryView.module.css';

type FilterKey = 'topic' | 'center';

function readList(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function GalleryView() {
  const { items, setNavIds } = useResults();
  const [params, setParams] = useSearchParams();

  // Filters live in the URL, e.g. ?topic=mars,apollo&center=JPL
  const topics = readList(params.get('topic'));
  const centers = readList(params.get('center'));

  const centerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.center, (counts.get(item.center) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Cheap enough for ~200 items, so no memo needed
  const shown = items.filter(
    (item) =>
      (topics.length === 0 || topics.includes(item.topic)) &&
      (centers.length === 0 || centers.includes(item.center))
  );

  const toggle = (key: FilterKey, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const current = readList(prev.get(key));
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        if (updated.length) next.set(key, updated.join(','));
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  };

  const clearFilters = () => setParams({}, { replace: true });
  const rememberOrder = () => setNavIds(shown.map((item) => item.nasaId));
  const hasFilters = topics.length > 0 || centers.length > 0;

  const chipClass = (active: boolean) =>
    active ? `${styles.chip} ${styles.chipActive}` : styles.chip;

  return (
    <section>
      <h1 className={styles.heading}>Gallery</h1>

      <div className={styles.filters}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Mission topic</legend>
          <div className={styles.chips}>
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                aria-pressed={topics.includes(topic)}
                className={chipClass(topics.includes(topic))}
                onClick={() => toggle('topic', topic)}
              >
                {capitalize(topic)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>NASA center</legend>
          <div className={styles.chips}>
            {centerCounts.map(([center, count]) => (
              <button
                key={center}
                type="button"
                aria-pressed={centers.includes(center)}
                className={chipClass(centers.includes(center))}
                onClick={() => toggle('center', center)}
              >
                {center}
                <span className={styles.chipCount}>{count}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.summary}>
        <p aria-live="polite">
          {shown.length} of {items.length} images
        </p>
        {hasFilters && (
          <button type="button" className={styles.clear} onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>
          No images match this combination. Remove a filter to see more.
        </p>
      ) : (
        <ul className={styles.grid}>
          {shown.map((item) => (
            <li key={item.nasaId}>
              <Link
                to={`/item/${encodeURIComponent(item.nasaId)}`}
                className={styles.tile}
                onClick={rememberOrder}
              >
                <img src={item.thumbnail} alt="" loading="lazy" className={styles.image} />
                <span className={styles.caption}>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
