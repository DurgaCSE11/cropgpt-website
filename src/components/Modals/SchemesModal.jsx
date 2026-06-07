import React, { useEffect, useState } from 'react';
import { askGemini } from '../../geminiService';

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
      const prompt = `Generate a JSON array of 4 popular government schemes for farmers in Odisha (including KALIA, PM-KISAN, and others). Return ONLY the raw JSON array, no markdown block formatting. Follow this format:
      [
        {"title": "KALIA Scheme", "description": "Provides financial aid of ₹10,000 per year to small and marginal farmers in Odisha..."},
        ...
      ]`;
      const responseText = await askGemini(prompt);
      
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      setSchemes(data);
    } catch (err) {
      console.warn("Gemini schemes generation failed, using static data:", err.message);
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
          <p style={{ textAlign: 'center', color: '#00dd00' }}>✨ AI is fetching the latest government schemes...</p>
        ) : (
          <div id="schemesContainer">
            {schemes.map((s, index) => (
              <div key={index} className="scheme-card">
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
