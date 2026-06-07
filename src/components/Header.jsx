import React from 'react';

export default function Header({ unreadNotificationsCount, onOpenNotifications, onOpenAbout, language, onLanguageChange }) {
  return (
    <header className="header" style={{ flexWrap: 'wrap', gap: '15px' }}>
      <div className="logo-container">
        <img src="/logo.png" alt="Crop GPT Logo" />
        <h1>Crop GPT</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Global Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-language" style={{ fontSize: '1.5rem', color: 'var(--primary-neon)' }}></i>
          <select 
            value={language} 
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '5px',
              padding: '6px 10px',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
          </select>
        </div>

        <div className="header-icons">
          <i 
            id="notificationsBtn" 
            className="fas fa-bell" 
            title="Notifications"
            onClick={onOpenNotifications}
          >
            {unreadNotificationsCount > 0 && (
              <span className="notification-badge">{unreadNotificationsCount}</span>
            )}
          </i>
          <i 
            id="aboutBtn" 
            className="fas fa-info-circle" 
            title="About Us"
            onClick={onOpenAbout}
          ></i>
        </div>
      </div>
    </header>
  );
}
