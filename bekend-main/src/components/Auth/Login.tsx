import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const Login = ({ onSwitchToRegister, onSwitchToForgotPassword }: LoginProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔐 Кіру</h1>
        <p className="auth-subtitle">Өз аккаунтыңызға кіріңіз</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Құпиясөз</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Құпиясөзіңіз"
              required
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Кіріп жатыр...' : 'Кіру'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button type="button" className="link-btn" onClick={onSwitchToForgotPassword}>
              Құпиясөзді ұмыт қойдың ба?
            </button>
          </p>
          <p>
            Аккаунтыңыз жоқ па?{' '}
            <button type="button" className="link-btn" onClick={onSwitchToRegister}>
              Тіркелу
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
