import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const { isDarkTheme, toggleTheme } = useTheme();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper: get first letter of user's name
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // Only show avatar menu on dashboard and if user is logged in
  const showAvatarMenu = user && location.pathname.startsWith('/dashboard');

  // Helper: detect mobile (<=900px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show login icon on Home, mobile, and not logged in
  const showMobileLoginIcon = !user && isMobile && (location.pathname === '/' || location.pathname === '/home');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ATS Scorer
        </Link>
        <div className="nav-right">
          {/* Desktop Menu */}
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-links">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/analyze" className="nav-links">
                Analyze Resume
              </Link>
            </li>
          </ul>
          {/* Avatar menu for dashboard */}
          {showAvatarMenu ? (
            <div className="avatar-menu-wrapper">
              <button
                className="avatar-circle"
                onClick={() => setAvatarMenuOpen(open => !open)}
                aria-label="Open user menu"
                aria-expanded={avatarMenuOpen}
              >
                {getInitial(user.name)}
              </button>
              {avatarMenuOpen && (
                <ul className="avatar-dropdown-menu">
                  <li>
                    <button className="icon-btn" onClick={onLogout}>Logout</button>
                  </li>
                </ul>
              )}
            </div>
          ) : user ? (
            <>
              <span className="welcome-message">Welcome, {user.name}</span>
              <button className="logout-button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkTheme ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
              </svg>
            )}
            <span>{isDarkTheme ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {showMobileLoginIcon && (
            <button
              className="mobile-login-icon-btn"
              aria-label="Login"
              onClick={() => navigate('/login')}
            >
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 15l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 