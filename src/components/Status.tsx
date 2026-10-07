import styles from './Status.module.css';

interface Props {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function Status({ loading, error, onRetry }: Props) {
  if (loading) {
    return <p className={styles.message}>Loading images from NASA...</p>;
  }
  return (
    <div className={styles.status} role="alert">
      <p className={styles.message}>{error}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
