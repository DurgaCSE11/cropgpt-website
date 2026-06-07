import React from 'react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={`modal show`}>
      <div className="modal-content neon-border about-section">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>About Crop GPT</h2>
        <p><strong>Our Mission:</strong> To empower the farmers of Odisha with modern technology, real-time data, and a supportive community, helping to increase yield, improve financial stability, and promote sustainable agricultural practices.</p>
        <h3 style={{ margin: '15px 0 10px', color: 'var(--primary-neon)' }}>Key Features:</h3>
        <ul style={{ paddingLeft: '20px', listStyleType: 'disc', textAlign: 'left' }}>
          <li style={{ marginBottom: '8px' }}><strong>AI Chat Assistant:</strong> Get instant answers to your farming questions.</li>
          <li style={{ marginBottom: '8px' }}><strong>Hyperlocal Weather Alerts:</strong> Detailed weather and crop advisories for every district in Odisha.</li>
          <li style={{ marginBottom: '8px' }}><strong>Comprehensive Management Tools:</strong> Manage your finances, crops, and learn about government schemes all in one place.</li>
          <li style={{ marginBottom: '8px' }}><strong>Farmer Community:</strong> Connect with fellow farmers to ask questions and share knowledge.</li>
        </ul>
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Contact us: support@cropgpt.com</p>
      </div>
    </div>
  );
}
