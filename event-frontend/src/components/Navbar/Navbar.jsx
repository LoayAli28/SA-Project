import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import SearchBar from '../SearchBar/SearchBar';
import "./Navbar.css";
import logo from "./Eventra_logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  const displayName = user?.fullName || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="nav-content">

        {/* LEFT */}
        <div className="nav-left">
          <img
            src={logo}
            alt="Eventra"
            className="logo-img"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <Link to="/" className="nav-logo">Eventra</Link>
        </div>

        {/* MIDDLE */}
        <div className="nav-middle">
          {!user && (
            <>
              <Link to="/" className={navLinkClass('/')}>Home</Link>
              <Link to="/events" className={navLinkClass('/events')}>Events</Link>
            </>
          )}

          {user?.role === 'Participant' && (
            <>
              <Link to="/" className={navLinkClass('/')}>Home</Link>
              <Link to="/participant" className={navLinkClass('/participant')}>Book a Ticket</Link>
              
              <Link to="/my-tickets" className={navLinkClass('/my-tickets')}>My Tickets</Link>
              
            </>
          )}

          {user?.role === 'Organizer' && (
            <>
              <Link to="/organizer" className={navLinkClass('/organizer')}>Dashboard</Link>
              <Link to="/organizer/events" className={navLinkClass('/organizer/events')}>My Events</Link>
              <Link to="/organizer/create" className={navLinkClass('/organizer/create')}>Create Event</Link>
              <Link to="/organizer/scan"   className={navLinkClass('/organizer/scan')}></Link>
            </>
          )}

          {user?.role === 'Admin' && (
            <>
              <Link to="/admin" className={navLinkClass('/admin')}>Dashboard</Link>
              <Link to="/admin/organizers" className={navLinkClass('/admin/organizers')}>Organizers</Link>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="nav-right">
          <SearchBar />

          {!user && (
            <div className="auth-buttons">
              <button
                className={location.pathname === '/login' ? 'btn-primary' : 'btn-outline'}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className={location.pathname === '/register' ? 'btn-primary' : 'btn-outline'}
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          )}

          {user && (
            <>
              {/* 🔔 Notification Bell — uses SignalR + REST */}
              <NotificationBell />

              {/* Avatar + Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <div
                  className="avatar"
                  onClick={() => setShowProfile(p => !p)}
                  title={displayName}
                >
                  {avatarLetter}
                </div>

                {showProfile && (
                  <div className="dropdown profile-dropdown">
                    <div className="profile-header">
                      <div className="profile-name">{displayName}</div>
                      <div className="profile-role">{user?.role}</div>
                    </div>
                    {user?.role === 'Participant' && (
                      <Link
                        to="/participant"
                        className="dropdown-item"
                        onClick={() => setShowProfile(false)}
                      >
                        My Dashboard
                      </Link>
                    )}
                    {user?.role === 'Organizer' && (
                      <Link
                        to="/organizer"
                        className="dropdown-item"
                        onClick={() => setShowProfile(false)}
                      >
                        My Dashboard
                      </Link>
                    )}
                    <div className="dropdown-item logout-item" onClick={handleLogout}>
                      Logout ⏻
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
