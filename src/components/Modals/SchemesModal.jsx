import React from 'react';

const govtSchemes = [
  {
    title: "KALIA (Krushak Assistance for Livelihood and Income Augmentation)",
    description: "Provides financial support to small and marginal farmers for cultivation, livelihood, and insurance."
  },
  {
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "A central government scheme providing an income support of ₹6,000 per year in three equal installments to all landholding farmer families."
  },
  {
    title: "Balaram Yojana",
    description: "Aims to provide agricultural credit to landless farmers through Joint Liability Groups (JLGs)."
  },
  {
    title: "Odisha Millets Mission (OMM)",
    description: "Promotes the cultivation and consumption of millets, providing technical support and market linkages to farmers."
  }
];

export default function SchemesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Government Schemes for Farmers</h2>
        <div id="schemesContainer">
          {govtSchemes.map((s, index) => (
            <div key={index} className="scheme-card">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
