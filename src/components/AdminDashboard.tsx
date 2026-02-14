import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import type { LabSupply } from '../data/supplies';
import { labSupplies as initialSupplies } from '../data/supplies';
import './AdminPanel.css';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

type AdminTab = 'users' | 'supplies' | 'dashboard';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<UserData[]>([]);
  const [supplies, setSupplies] = useState<LabSupply[]>(initialSupplies);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    setLoading(false);
  }, []);

  const loadUsers = () => {
    try {
      const allUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
      const usersWithoutPassword = allUsers.map(({ password, ...userWithoutPassword }: any) => userWithoutPassword);
      setUsers(usersWithoutPassword);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === 'admin-001') {
      alert('Admin аккаунтын өшіре алмайсыз!');
      return;
    }

    if (window.confirm('Бұл пайдаланушыны өшіргіні міңіз бе?')) {
      const allUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
      const updatedUsers = allUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem('labSupplyUsers', JSON.stringify(updatedUsers));
      loadUsers();
    }
  };

  const changeUserRole = (userId: string, newRole: 'user' | 'admin') => {
    if (userId === 'admin-001') {
      alert('Admin рөлін өзгерте алмайсыз!');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
    const updatedUsers = allUsers.map((u: any) => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    localStorage.setItem('labSupplyUsers', JSON.stringify(updatedUsers));
    loadUsers();
  };

  const handleDeleteSupply = (id: string) => {
    setSupplies(supplies.filter((s) => s.id !== id));
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="admin-dashboard">Құптелінді...</div>;
  }

  return (
    <div className="admin-dashboard">
      <Header
        favoritesCount={0}
        compareCount={0}
        isAdmin={true}
        onShowAdmin={() => {}}
        onShowFavorites={() => {}}
        onShowCompare={() => {}}
      />

      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-info">
            <div className="admin-avatar">⚙️</div>
            <div className="admin-details">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <p className="admin-role">👑 Admin</p>
            </div>
          </div>

          <nav className="admin-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Есептемесі
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Пайдаланушылар
            </button>
            <button
              className={`nav-item ${activeTab === 'supplies' ? 'active' : ''}`}
              onClick={() => setActiveTab('supplies')}
            >
              📦 Өндіктер
            </button>
            <button className="nav-item logout" onClick={handleLogout}>
              🚪 Шығу
            </button>
          </nav>
        </div>

        <div className="admin-main">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <section className="admin-section">
              <h1>📊 Админ Панелінің Лакм</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <div className="stat-number">{users.length}</div>
                    <div className="stat-label">Барлығы пайдаланушы</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👑</div>
                  <div className="stat-content">
                    <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
                    <div className="stat-label">Admin есептелері</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👤</div>
                  <div className="stat-content">
                    <div className="stat-number">{users.filter(u => u.role === 'user').length}</div>
                    <div className="stat-label">Қарапайым пайдаланушылар</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-content">
                    <div className="stat-number">{supplies.length}</div>
                    <div className="stat-label">Барлығы өндіктер</div>
                  </div>
                </div>
              </div>

              <div className="recent-section">
                <h2>Соңғы пайдаланушылар</h2>
                {users.slice(0, 5).length > 0 ? (
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>Есім</th>
                        <th>Email</th>
                        <th>Рөлі</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((userData) => (
                        <tr key={userData.id}>
                          <td>{userData.name}</td>
                          <td>{userData.email}</td>
                          <td><span className={`role-badge ${userData.role}`}>{userData.role === 'admin' ? '👑 Admin' : '👤 Пайдаланушы'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">Пайдаланушылар жоқ</p>
                )}
              </div>
            </section>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <section className="admin-section">
              <h1>👥 Пайдаланушыларды басқару</h1>
              
              {users.length === 0 ? (
                <p className="no-data">Пайдаланушылар жоқ</p>
              ) : (
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Есім</th>
                        <th>Email</th>
                        <th>Рөлі</th>
                        <th>Тіркелген күні</th>
                        <th>Әрекеттер</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr key={userData.id} className={userData.role === 'admin' ? 'admin-row' : ''}>
                          <td>
                            {userData.id === 'admin-001' && '👑'} {userData.name}
                          </td>
                          <td>{userData.email}</td>
                          <td>
                            <select
                              value={userData.role}
                              onChange={(e) => changeUserRole(userData.id, e.target.value as 'user' | 'admin')}
                              className={`role-select ${userData.role}`}
                              disabled={userData.id === 'admin-001'}
                            >
                              <option value="user">👤 Пайдаланушы</option>
                              <option value="admin">👑 Admin</option>
                            </select>
                          </td>
                          <td>{new Date(userData.createdAt).toLocaleDateString('kk-KZ')}</td>
                          <td>
                            <button
                              onClick={() => deleteUser(userData.id)}
                              className="delete-btn"
                              disabled={userData.id === 'admin-001'}
                              title={userData.id === 'admin-001' ? 'Admin өшіруге болмайды' : 'Өшіру'}
                            >
                              🗑️ Өшіру
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Supplies Tab */}
          {activeTab === 'supplies' && (
            <section className="admin-section">
              <h1>📦 Өндіктерді басқару</h1>
              
              {supplies.length === 0 ? (
                <p className="no-data">Өндіктер жоқ</p>
              ) : (
                <div className="supplies-grid">
                  {supplies.map((supply) => (
                    <div key={supply.id} className="supply-card">
                      <div className="supply-header">
                        <h3>{supply.name}</h3>
                        <button
                          onClick={() => handleDeleteSupply(supply.id)}
                          className="delete-btn-small"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="supply-info">
                        <p><strong>Категория:</strong> {supply.category}</p>
                        <p><strong>Өндіруші:</strong> {supply.manufacturer || 'Белгіленбеген'}</p>
                        <p><strong>Баланы:</strong> ${supply.price}</p>
                        <p className={`availability ${supply.availability.toLowerCase().replace(' ', '-')}`}>
                          {supply.availability}
                        </p>
                      </div>
                      <p className="supply-description">{supply.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
