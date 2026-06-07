import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AuthModal({ isOpen, mode, onClose, onAuthSuccess }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [scale, setScale] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = `${mobile.trim()}@cropgpt.com`;

    try {
      if (mode === 'signup') {
        // 1. Sign Up User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData?.user) {
          // 2. Insert details into public.profiles
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              name: name.trim(),
              phone: mobile.trim(),
              location: location.trim(),
              farmer_scale: scale,
              address: address.trim(),
              pincode: pincode.trim(),
            },
          ]);

          if (profileError) {
            console.error("Error creating profile:", profileError);
            throw new Error("Account created but profile setup failed: " + profileError.message);
          }
        }

        alert('Registration Successful! Please check if verification is needed, or proceed to login.');
        onAuthSuccess();
        onClose();
      } else {
        // Login Flow
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        alert('Login Successful!');
        onAuthSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal show`}>
      <div className="modal-content neon-border" style={{ position: 'relative' }}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{mode === 'signup' ? 'Create Account' : 'Login'}</h2>
        {error && <div style={{ color: 'var(--expense-color)', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>{mode === 'signup' ? 'Number' : 'Mobile Number'}</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g., Cuttack"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Scale of Farmer</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Scale --</option>
                  <option value="small">Small-scale</option>
                  <option value="medium">Medium-scale</option>
                  <option value="large">Large-scale</option>
                </select>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  placeholder="Full Address"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  placeholder="6-digit Pincode"
                  pattern="\d{6}"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
