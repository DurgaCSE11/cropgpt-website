import React, { useState } from 'react';
import { askGemini } from '../../geminiService';

const staticCrops = {
  rice: { name: "Rice (Paddy)", soil: "Clayey and loamy soils", fertilizer: "Nitrogen (Urea), Phosphorus, Potassium", watering: "Requires standing water (2-5 cm), frequent irrigation", harvest: "Approx. 90-120 days after planting" },
  maize: { name: "Maize (Corn)", soil: "Well-drained loamy soils", fertilizer: "High Nitrogen, Phosphorus", watering: "Once every 5-7 days during peak growth", harvest: "Approx. 60-100 days, when silks are dry" },
  sugarcane: { name: "Sugarcane", soil: "Loamy, well-drained soils", fertilizer: "NPK complex, pressmud", watering: "Frequent watering, especially during formative stage", harvest: "Approx. 10-18 months" },
  cotton: { name: "Cotton", soil: "Black cotton soil, well-drained", fertilizer: "Nitrogen and Phosphorus", watering: "Infrequent but deep watering", harvest: "Approx. 150-180 days" },
  groundnut: { name: "Groundnut (Peanut)", soil: "Sandy loam soils", fertilizer: "Phosphorus, Potassium, Gypsum", watering: "Every 8-10 days, avoid waterlogging", harvest: "Approx. 90-130 days" }
};

export default function CropModal({ isOpen, onClose }) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCropChange = async (e) => {
    const cropKey = e.target.value;
    setSelectedCrop(cropKey);
    if (!cropKey) return;

    setLoading(true);
    setCropData(null);

    const displayName = staticCrops[cropKey]?.name || cropKey;

    try {
      const prompt = `Generate a JSON object of crop guidelines for "${displayName}". Return ONLY the raw JSON object, no markdown styling. Format:
      {"name": "${displayName}", "soil": "ideal soils description", "fertilizer": "recommended fertilizers", "watering": "watering instructions", "harvest": "harvest duration days"}`;
      
      const responseText = await askGemini(prompt);
      
      // Extract and Parse JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      setCropData(data);
    } catch (err) {
      console.warn("Gemini guide generation failed, falling back to static data:", err.message);
      setCropData(staticCrops[cropKey] || null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Crop Manager</h2>
        
        <div className="form-group">
          <label htmlFor="cropSelector">Select a Crop to get AI-generated guidelines:</label>
          <select 
            id="cropSelector"
            value={selectedCrop}
            onChange={handleCropChange}
          >
            <option value="" disabled>-- Select a Crop --</option>
            {Object.keys(staticCrops).map(key => (
              <option key={key} value={key}>{staticCrops[key].name}</option>
            ))}
          </select>
        </div>

        <div id="cropInfoDisplay">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#00dd00' }}>✨ AI is compiling your crop guideline guide...</p>
          ) : cropData ? (
            <div>
              <h3>{cropData.name} Guide (AI Generated)</h3>
              <div className="crop-info-grid">
                <div className="crop-info-item">
                  <strong>Soil Type:</strong> {cropData.soil}
                </div>
                <div className="crop-info-item">
                  <strong>Fertilizer:</strong> {cropData.fertilizer}
                </div>
                <div className="crop-info-item">
                  <strong>Watering:</strong> {cropData.watering}
                </div>
                <div className="crop-info-item">
                  <strong>Harvest Time:</strong> {cropData.harvest}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Select a crop from the dropdown to see its details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
