import React from 'react';

export default function DashboardGrid({ onOpenModal }) {
  const cards = [
    { key: 'weather', icon: 'fa-cloud-sun-rain', label: 'Weather Alerts' },
    { key: 'finance', icon: 'fa-wallet', label: 'Finance Manager' },
    { key: 'crop', icon: 'fa-seedling', label: 'Crop Manager' },
    { key: 'schemes', icon: 'fa-landmark', label: 'Govt Schemes' },
    { key: 'community', icon: 'fa-users', label: 'Community' },
    { key: 'farmkart', icon: 'fa-shopping-cart', label: 'Farm Kart' }
  ];

  return (
    <main className="main-content">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <div 
            key={c.key}
            className="dashboard-item neon-border"
            onClick={() => onOpenModal(c.key)}
          >
            <i className={`fas ${c.icon}`}></i>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
