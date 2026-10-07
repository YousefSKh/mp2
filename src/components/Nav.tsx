import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <header className={styles.bar}>
      <NavLink to="/" className={styles.brand}>
        NASA Image Explorer
      </NavLink>
      <nav className={styles.links} aria-label="Views">
        <NavLink to="/" end className={linkClass}>
          Search
        </NavLink>
        <NavLink to="/gallery" className={linkClass}>
          Gallery
        </NavLink>
      </nav>
    </header>
  );
}