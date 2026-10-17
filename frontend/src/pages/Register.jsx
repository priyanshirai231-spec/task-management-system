import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
    const res = await api.post('/api/auth/register', { name, email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>TASK FLOW</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Sign up to start organizing your workspace</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              required
              placeholder="Pri"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#0b0f19',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '16px',
    padding: '40px 32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#d1d5db',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#ffffff',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
  },
  footerText: {
    marginTop: '28px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#9ca3af',
  },
  link: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: '500',
  },
};