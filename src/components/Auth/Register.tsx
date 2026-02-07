import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await register(formData.email, formData.password, formData.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>📝 Тіркелу</h1>
        <p className="auth-subtitle">Жаңа аккаунт құру</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Есім</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Өзіңіздің есімінізді енгізіңіз"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Құпиясөз</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Құпиясөзді енгізіңіз"
              required
            />
            <small>Кем дегенде 6 символ</small>
          </div>

          <div className="form-group">
            <label>Құпиясөзді қайта енгізіңіз</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Құпиясөзді қайта енгізіңіз"
              required
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Тіркеліп жатыр...' : 'Тіркелу'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Аккаунтыңыз бар ма?{' '}
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>
              Кіру
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
