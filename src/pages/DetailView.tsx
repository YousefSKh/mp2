import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLargeImage } from '../api/nasa';
import { useResults } from '../context/ResultsContext';
import { formatDate } from '../utils/format';
import styles from './DetailView.module.css';

function itemPath(id: string): string {
  return `/item/${encodeURIComponent(id)}`;
}

export default function DetailView() {
  const { nasaId = '' } = useParams();
  const { items, navIds } = useResults();
  const navigate = useNavigate();
  const [large, setLarge] = useState<{ id: string; url: string } | null>(null);

  const item = items.find((i) => i.nasaId === nasaId);

  // Cycle through the list the user came from, or everything on direct visits
  const order = navIds.includes(nasaId) ? navIds : items.map((i) => i.nasaId);
  const index = order.indexOf(nasaId);
  const prevId = index >= 0 ? order[(index - 1 + order.length) % order.length] : null;
  const nextId = index >= 0 ? order[(index + 1) % order.length] : null;

  // Replace keeps prev/next out of history, so Back returns to the list
  const goTo = (id: string | null) => {
    if (id) navigate(itemPath(id), { replace: true });
  };

  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
  };

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    getLargeImage(item).then((url) => {
      if (!cancelled) setLarge({ id: item.nasaId, url });
    });
    return () => {
      cancelled = true;
    };
  }, [item]);

  // Left and right arrow keys also work
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' && prevId) navigate(itemPath(prevId), { replace: true });
      if (e.key === 'ArrowRight' && nextId) navigate(itemPath(nextId), { replace: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevId, nextId, navigate]);

  if (!item) {
    return (
      <section className={styles.missing}>
        <h1 className={styles.title}>Image not found</h1>
        <p className={styles.description}>
          No image with the ID "{nasaId}" is in this collection.
        </p>
        <Link to="/" className={styles.button}>
          Go to search
        </Link>
      </section>
    );
  }

  const imageSrc = large?.id === item.nasaId ? large.url : item.thumbnail;

  return (
    <article>
      <div className={styles.toolbar}>
        <button type="button" className={styles.back} onClick={goBack}>
          Back to results
        </button>
        <div className={styles.pager}>
          <button type="button" className={styles.button} onClick={() => goTo(prevId)}>
            Previous
          </button>
          <span className={styles.position}>
            {index + 1} of {order.length}
          </span>
          <button type="button" className={styles.button} onClick={() => goTo(nextId)}>
            Next
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <figure className={styles.figure}>
          <img src={imageSrc} alt={item.title} className={styles.image} />
        </figure>

        <div>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.description}>{item.description}</p>

          <dl className={styles.facts}>
            <div>
              <dt>Date taken</dt>
              <dd>{formatDate(item.dateCreated)}</dd>
            </div>
            <div>
              <dt>NASA center</dt>
              <dd>{item.center}</dd>
            </div>
            {item.photographer && (
              <div>
                <dt>Photographer</dt>
                <dd>{item.photographer}</dd>
              </div>
            )}
            {item.location && (
              <div>
                <dt>Location</dt>
                <dd>{item.location}</dd>
              </div>
            )}
            <div>
              <dt>Topic</dt>
              <dd className={styles.capitalize}>{item.topic}</dd>
            </div>
            <div>
              <dt>NASA ID</dt>
              <dd>{item.nasaId}</dd>
            </div>
          </dl>

          {item.keywords.length > 0 && (
            <>
              <h2 className={styles.subhead}>Keywords</h2>
              <ul className={styles.tags}>
                {item.keywords.map((k) => (
                  <li key={k}>
                    <Link to={`/?q=${encodeURIComponent(k)}`} className={styles.tag}>
                      {k}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
