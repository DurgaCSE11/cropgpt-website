import React, { useEffect, useState } from 'react';
import { askGemini } from '../../geminiService';

export default function SchemesModal({ isOpen, onClose, language }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSchemes();
    }
  }, [isOpen, language]);

  const loadSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      // Prompt Gemini to fetch the absolute current/present schemes without hardcoded suggestions
      const prompt = `Generate a JSON array of 4 active, current government schemes for farmers in Odisha or India. Return ONLY the raw JSON array, no markdown code block formatting. Follow this format exactly:
      [
        {"title": "Name of the active scheme", "description": "Details about financial assistance, eligibility, and benefits of the scheme."}
      ]`;
      const responseText = await askGemini(prompt, language);
      
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      setSchemes(data);
    } catch (err) {
      console.warn("Gemini schemes generation failed:", err.message);
      setError("Unable to load live government schemes. Please check your Gemini API connection.");
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
          <p style={{ textAlign: 'center', color: '#00dd00' }}>✨ AI is compiling current government agricultural schemes...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'var(--expense-color)', fontWeight: 'bold' }}>{error}</p>
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
