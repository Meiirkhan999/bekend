import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

interface ForgotPasswordProps {
  onSwitchToLogin: () => void;
}

export const ForgotPassword = ({ onSwitchToLogin }: ForgotPasswordProps) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔑 Құпиясөзді ұмыт қойдың</h1>
        <p className="auth-subtitle">Құпиясөзді қалпына келтіру</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Өзіңіздің emailыңызды енгізіңіз"
              required
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}
          {success && (
            <div className="success-message">
              ✅ Растау сілтемесі email-ыңызға жіберілді. Сілтемеге өтіңіз.
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Жіберіліп жатыр...' : 'Растау сілтемесін жіберу'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button type="button" className="link-btn" onClick={onSwitchToLogin}>
              Кіру беттеріне қайту
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
