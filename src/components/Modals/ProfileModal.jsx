import React, { useState } from 'react';

export default function ProfileModal({ isOpen, onClose, language }) {
  // Mock data for the farmer's profile
  const [profile, setProfile] = useState({
    fullName: 'Ramesh Farmer',
    district: 'Sambalpur',
    primaryCrops: 'Rice (Paddy), Maize',
    phone: '+91 98765 43210',
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile saved successfully!');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>Farmer Profile</h2>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        <div style={styles.body}>
          <label style={styles.label}>Full Name</label>
          <input 
            type="text" 
            name="fullName"
            value={profile.fullName} 
            onChange={handleChange}
            disabled={!isEditing}
            style={styles.input}
          />

          <label style={styles.label}>District</label>
          <select 
            name="district" 
            value={profile.district} 
            onChange={handleChange} 
            disabled={!isEditing}
            style={styles.input}
          >
            <option value="Sambalpur">Sambalpur</option>
            <option value="Cuttack">Cuttack</option>
            <option value="Bargarh">Bargarh</option>
          </select>

          <label style={styles.label}>Primary Crops</label>
          <input 
            type="text" 
            name="primaryCrops"
            value={profile.primaryCrops} 
            onChange={handleChange}
            disabled={!isEditing}
            style={styles.input}
          />

          <label style={styles.label}>Phone Number</label>
          <input 
            type="text" 
            name="phone"
            value={profile.phone} 
            onChange={handleChange}
            disabled={!isEditing}
            style={styles.input}
          />
        </div>

        <div style={styles.footer}>
          {isEditing ? (
            <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
          ) : (
            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#fff', borderRadius: '8px', width: '90%', maxWidth: '400px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#333' },
  body: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontWeight: 'bold', fontSize: '14px', color: '#333' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', color: '#000' },
  footer: { marginTop: '20px', display: 'flex', justifyContent: 'flex-end' },
  editBtn: { padding: '10px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { padding: '10px 15px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};