// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import './auth.css';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Participant',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await registerUser(form);
      setMessage('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <Link to="/register" className="auth-tab active">Register</Link>
          <Link to="/login" className="auth-tab">Login</Link>
        </div>

        <div className="auth-header">
          <h2>Eventra</h2>
          <p>Create your account today.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="auth-field" style={{ flex: 1 }}>
              <label className="auth-label">First Name</label>
              <input name="firstName" className="auth-input" placeholder="First Name"
                value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="auth-field" style={{ flex: 1 }}>
              <label className="auth-label">Last Name</label>
              <input name="lastName" className="auth-input" placeholder="Last Name"
                value={form.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input type="email" name="email" className="auth-input"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input type="password" name="password" className="auth-input"
              placeholder="••••••••"
              value={form.password} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label className="auth-label">Register As</label>
            <select
              name="role"
              className="auth-input"
              value={form.role}
              onChange={handleChange}
              style={{ 
                cursor: 'pointer', 
                backgroundColor: 'var(--bg-light)', 
                color: 'white',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)'
              }}
            >
              <option value="Participant">Participant</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-bottom-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}