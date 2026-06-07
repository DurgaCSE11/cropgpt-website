import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const staticSchemes = [
  { title: "KALIA (Krushak Assistance for Livelihood and Income Augmentation)", description: "Provides financial support to small and marginal farmers for cultivation, livelihood, and insurance." },
  { title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)", description: "A central government scheme providing an income support of ₹6,000 per year in three equal installments to all landholding farmer families." },
  { title: "Balaram Yojana", description: "Aims to provide agricultural credit to landless farmers through Joint Liability Groups (JLGs)." },
  { title: "Odisha Millets Mission (OMM)", description: "Promotes the cultivation and consumption of millets, providing technical support and market linkages to farmers." }
];

export default function SchemesModal({ isOpen, onClose }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSchemes();
    }
  }, [isOpen]);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schemes')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setSchemes(data);
      } else {
        setSchemes(staticSchemes);
      }
    } catch (err) {
      console.warn("Could not fetch schemes from DB, using mock data:", err.message);
      setSchemes(staticSchemes);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Government Schemes for Farmers</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading government schemes...</p>
        ) : (
          <div id="schemesContainer">
            {schemes.map((s, index) => (
              <div key={s.id || index} className="scheme-card">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
