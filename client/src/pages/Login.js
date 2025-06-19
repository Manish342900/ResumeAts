import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import googleIcon from '../assets/google-icon.svg';

const Login = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Google OAuth callback (single useEffect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      setError('Google login failed. Please try again.');
      setLoading(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    if (token) {
      handleGoogleAuthSuccess(token);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGoogleAuthSuccess = async (token) => {
    try {
      const verifyResponse = await fetch('http://localhost:5000/api/verify-auth', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!verifyResponse.ok) throw new Error('Token verification failed');
      const userData = await verifyResponse.json();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      if (onAuthSuccess) onAuthSuccess(userData.user, token);
      navigate('/dashboard');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-bg-gradient">
      <div className="login-center-container">
        <div className="login-card">
          <h2 className="login-title">Sign in to ATS Scorer</h2>
          <p className="login-subtitle">Welcome back! Please login to your account.</p>
          {error && <div className="login-error-message">{error}</div>}

          <button
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src={googleIcon} alt="Google" className="login-google-icon" />
            Continue with Google
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="login-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="login-input"
                autoComplete="username"
                placeholder="Enter your email"
              />
            </div>
            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="login-input"
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <span>Don't have an account? </span>
            <Link to="/register" className="login-link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;