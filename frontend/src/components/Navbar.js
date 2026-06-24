import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    alert('Logged out successfully!');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🧳</span>
            <span className="logo-text">Roaming Sonic</span>
          </Link>

          <div className="navbar-links">
            <Link to="/hotels" className={`nav-link${isActive('/hotels') ? ' active' : ''}`}>
              <span className="nav-icon">🏨</span>
              Hotels
            </Link>
            <Link to="/guides" className={`nav-link${isActive('/guides') ? ' active' : ''}`}>
              <span className="nav-icon">🧭</span>
              Guides
            </Link>
            <Link to="/buses" className={`nav-link${isActive('/buses') ? ' active' : ''}`}>
              <span className="nav-icon">🚌</span>
              Buses
            </Link>
            <Link to="/tours" className={`nav-link${isActive('/tours') ? ' active' : ''}`}>
              <span className="nav-icon">🎒</span>
              Tours
            </Link>
            <Link to="/group-tours" className={`nav-link${isActive('/group-tours') ? ' active' : ''}`}>
              <span className="nav-icon">👥</span>
              Group Tours
            </Link>
          </div>

          <div className="navbar-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn-nav"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-btn nav-btn-dashboard">
                  <span className="btn-icon">📊</span>
                  <span className="btn-text">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="nav-btn nav-btn-logout">
                  <span className="btn-icon">🚪</span>
                  <span className="btn-text">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn nav-btn-login">
                  <span className="btn-icon">🔐</span>
                  <span className="btn-text">Login</span>
                </Link>
                <Link to="/register" className="nav-btn nav-btn-register">
                  <span className="btn-icon">✨</span>
                  <span className="btn-text">Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`bottom-tab${isActive('/') ? ' active' : ''}`}>
          <span className="bottom-tab-icon">🏠</span>
          <span className="bottom-tab-label">Home</span>
        </Link>
        <Link to="/hotels" className={`bottom-tab${isActive('/hotels') ? ' active' : ''}`}>
          <span className="bottom-tab-icon">🏨</span>
          <span className="bottom-tab-label">Hotels</span>
        </Link>
        <Link to="/tours" className={`bottom-tab${isActive('/tours') ? ' active' : ''}`}>
          <span className="bottom-tab-icon">🎒</span>
          <span className="bottom-tab-label">Tours</span>
        </Link>
        <Link to="/guides" className={`bottom-tab${isActive('/guides') ? ' active' : ''}`}>
          <span className="bottom-tab-icon">🧭</span>
          <span className="bottom-tab-label">Guides</span>
        </Link>
        <Link to="/buses" className={`bottom-tab${isActive('/buses') ? ' active' : ''}`}>
          <span className="bottom-tab-icon">🚌</span>
          <span className="bottom-tab-label">Buses</span>
        </Link>
        {isAuthenticated ? (
          <Link to="/dashboard" className={`bottom-tab${isActive('/dashboard') ? ' active' : ''}`}>
            <span className="bottom-tab-icon">📊</span>
            <span className="bottom-tab-label">Dashboard</span>
          </Link>
        ) : (
          <Link to="/login" className={`bottom-tab${isActive('/login') ? ' active' : ''}`}>
            <span className="bottom-tab-icon">🔐</span>
            <span className="bottom-tab-label">Login</span>
          </Link>
        )}
      </nav>
    </>
  );
};

export default Navbar;
