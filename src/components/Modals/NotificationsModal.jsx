import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const mockNotifications = [
  { id: 'mock-1', icon: 'fa-cloud-showers-heavy', title: 'Weather Alert: Sambalpur', message: 'Heavy rainfall expected in the next 48 hours. Please take necessary precautions for your crops.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), read: false },
  { id: 'mock-2', icon: 'fa-landmark', title: 'PM-KISAN Scheme', message: 'The next installment is scheduled to be released by October 15th. Ensure your eKYC is complete.', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), read: false },
  { id: 'mock-3', icon: 'fa-chart-line', title: 'Market Price Update', message: 'Paddy prices in Sambalpur market have increased by 2%. Current price is ₹2183/Quintal.', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), read: true },
  { id: 'mock-4', icon: 'fa-users', title: 'New Community Post', message: 'A farmer asked a new question about organic pesticides for rice. Join the discussion!', timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), read: true },
];

export default function NotificationsModal({ isOpen, onClose, user, onUpdateUnreadCount }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    if (onUpdateUnreadCount) onUpdateUnreadCount(unread);
  }, [notifications, onUpdateUnreadCount]);

  const fetchNotifications = async () => {
    if (!user) {
      // Load mock notifications if not logged in
      const savedMock = localStorage.getItem('mock_notifications');
      if (savedMock) {
        setNotifications(JSON.parse(savedMock));
      } else {
        setNotifications(mockNotifications);
        localStorage.setItem('mock_notifications', JSON.stringify(mockNotifications));
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      localStorage.setItem('mock_notifications', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err.message);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return seconds >= 0 ? Math.floor(seconds) + " seconds ago" : "just now";
  };

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <div className="notifications-header">
          <h2>Notifications</h2>
          <button id="markAllReadBtn" onClick={handleMarkAllRead}>Mark all as read</button>
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading alerts...</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary-neon)' }}></i>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div id="notificationsList">
            {notifications.map((n) => (
              <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
                <i className={`fas ${n.icon || 'fa-info-circle'} notification-icon`}></i>
                <div className="notification-content">
                  <div className="notification-title">{n.title}</div>
                  <p className="notification-message">{n.message}</p>
                  <div className="notification-time">{formatTimeAgo(n.created_at || n.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
