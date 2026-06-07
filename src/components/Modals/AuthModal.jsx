import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) throw authError;

      alert('Admin Login Successful!');
      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Admin Portal Login</h2>
        {error && <div style={{ color: 'var(--expense-color)', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="admin@cropgpt.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
