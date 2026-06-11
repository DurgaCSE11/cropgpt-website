import React from 'react';

export default function Header({ 
  unreadNotificationsCount, 
  onOpenNotifications, 
  onOpenAbout, 
  onOpenProfile, 
  language, 
  onLanguageChange 
}) {
  return (
    <header style={styles.header}>
      {/* TOP LEFT: Custom PNG Logo and Title */}
      <div style={styles.leftSection}>
        
        <img src="/logo.png" alt="Crop GPT Logo" style={styles.logoImage} /> 

        <h1 style={styles.title}>Crop GPT Dashboard</h1>
      </div>

      {/* TOP RIGHT: Controls, Icons, and Avatar */}
      <div style={styles.rightSection}>
        <select 
          value={language} 
          onChange={(e) => onLanguageChange(e.target.value)}
          style={styles.select}
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Odia">Odia</option>
        </select>

        <div style={styles.iconContainer} onClick={onOpenNotifications}>
          <i className="fas fa-bell" style={styles.icon}></i>
          {unreadNotificationsCount > 0 && (
            <span style={styles.badge}>{unreadNotificationsCount}</span>
          )}
        </div>

        <div style={styles.iconContainer} onClick={onOpenAbout}>
          <i className="fas fa-info-circle" style={styles.icon}></i>
        </div>

        {/* CLICKABLE AVATAR */}
        <div 
          style={styles.avatarContainer} 
          onClick={onOpenProfile} 
          title="Open Farmer Profile"
        >
          <i className="fas fa-user-circle" style={styles.avatarIcon}></i>
        </div>
        
      </div>
    </header>
  );
}

const styles = {
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px 20px', 
    backgroundColor: '#D4AF37', 
    color: '#1a1a1a', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
  },
  leftSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  
  // CHANGED: Removed circle logic, increased height, width auto-adjusts
  logoImage: { 
    height: '60px', 
    width: 'auto', 
    objectFit: 'contain' 
  }, 
  
  title: { margin: 0, fontSize: '22px', fontWeight: 'bold' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  select: { padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', cursor: 'pointer', backgroundColor: '#fff', color: '#333', fontWeight: 'bold' },
  iconContainer: { position: 'relative', cursor: 'pointer', fontSize: '20px' },
  icon: { color: '#1a1a1a' },
  badge: { position: 'absolute', top: '-8px', right: '-10px', backgroundColor: '#d32f2f', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' },
  avatarContainer: { cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s', marginLeft: '10px' },
  avatarIcon: { fontSize: '42px', color: '#1a1a1a' }, 
};