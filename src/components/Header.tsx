import { useAuth } from '../context/AuthContext';
import './Header.css';

interface HeaderProps {
  favoritesCount: number;
  compareCount: number;
  isAdmin: boolean;
  onShowAdmin: () => void;
  onShowFavorites: () => void;
  onShowCompare: () => void;
}

export const Header = ({
  favoritesCount,
  compareCount,
  isAdmin,
  onShowAdmin,
  onShowFavorites,
  onShowCompare,
}: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">🧪 Lab Supply Finder</h1>
      </div>

      <div className="header-center">
        <p className="app-subtitle">Зертханалық жабдықтарды іздеу жүйесі</p>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="header-btn favorites-btn" onClick={onShowFavorites} title="Таңдаулылар">
            ⭐ {favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}
          </button>

          <button className="header-btn compare-btn" onClick={onShowCompare} title="Салыстыру">
            🔄 {compareCount > 0 && <span className="badge">{compareCount}</span>}
          </button>

          {isAdmin && (
            <button className="header-btn admin-btn" onClick={onShowAdmin} title="Әкімші панелі">
              ⚙️
            </button>
          )}

          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className={`user-role ${user?.role}`}>{user?.role === 'admin' ? 'Әкімші' : 'Пайдаланушы'}</span>
          </div>

          <button className="header-btn logout-btn" onClick={logout} title="Шығу">
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};
