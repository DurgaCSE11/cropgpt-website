import React from 'react';

export default function Header({ unreadNotificationsCount, onOpenNotifications, onOpenAbout }) {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo.png" alt="Crop GPT Logo" />
        <h1>Crop GPT</h1>
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
    </header>
  );
}
