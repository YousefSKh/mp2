import { Navigate, Route, Routes } from 'react-router-dom';
import Nav from './components/Nav';
import Status from './components/Status';
import { useResults } from './context/ResultsContext.ts';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import styles from './App.module.css';

export default function App() {
  const { loading, error, reload } = useResults();

  return (
    <div className={styles.shell}>
      <Nav />
      <main className={styles.main}>
        {loading || error ? (
          <Status loading={loading} error={error} onRetry={reload} />
        ) : (
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/item/:nasaId" element={<DetailView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}