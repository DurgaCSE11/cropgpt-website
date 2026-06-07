import React, { useState, useEffect } from 'react';

export default function Sidebar({ user, profileName, onOpenLogin, onLogout, language }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleCloseDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  return (
    <aside className="left-sidebar neon-border">
      <div className={`profile-container ${dropdownOpen ? 'open' : ''}`}>
        <div 
          id="profileTrigger" 
          className="profile-section neon-border"
          onClick={handleToggleDropdown}
        >
          <i className="fas fa-user-circle profile-icon"></i>
          <span>{user ? 'Admin Console' : 'Profile'}</span>
          <i className="fas fa-chevron-down dropdown-arrow"></i>
        </div>
        
        <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
          {user ? (
            <a 
              href="#" 
              className="dropdown-item" 
              onClick={(e) => { e.preventDefault(); onLogout(); }}
            >
              <i className="fas fa-sign-out-alt"></i> Admin Logout
            </a>
          ) : (
            <a 
              href="#" 
              id="loginBtn" 
              className="dropdown-item"
              onClick={(e) => { e.preventDefault(); onOpenLogin(); }}
            >
              <i className="fas fa-sign-in-alt"></i> Admin Login
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
