// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ email, password });
      const data = res.data;

      const user = {
        email: data.user?.email || email,
        name: data.user?.fullName || email,
        role: data.user?.role || 'Participant',
      };

      login(user, data.token || 'local-token');
      if (user.role === 'Organizer') {
      navigate('/organizer');
    } else {
      navigate('/participant');
    }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <Link to="/register" className="auth-tab">Register</Link>
          <Link to="/login" className="auth-tab active">Login</Link>
        </div>

        <div className="auth-header">
          <h2>Eventra</h2>
          <p>Welcome back!</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-bottom-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}