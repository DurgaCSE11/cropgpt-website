import React, { useState } from 'react';
import { askGemini } from '../../geminiService';

const staticCrops = {
  rice: { name: "Rice (Paddy)", soil: "Clayey and loamy soils", fertilizer: "Nitrogen (Urea), Phosphorus, Potassium", watering: "Requires standing water (2-5 cm), frequent irrigation", harvest: "Approx. 90-120 days after planting" },
  maize: { name: "Maize (Corn)", soil: "Well-drained loamy soils", fertilizer: "High Nitrogen, Phosphorus", watering: "Once every 5-7 days during peak growth", harvest: "Approx. 60-100 days, when silks are dry" },
  sugarcane: { name: "Sugarcane", soil: "Loamy, well-drained soils", fertilizer: "NPK complex, pressmud", watering: "Frequent watering, especially during formative stage", harvest: "Approx. 10-18 months" },
  cotton: { name: "Cotton", soil: "Black cotton soil, well-drained", fertilizer: "Nitrogen and Phosphorus", watering: "Infrequent but deep watering", harvest: "Approx. 150-180 days" },
  groundnut: { name: "Groundnut (Peanut)", soil: "Sandy loam soils", fertilizer: "Phosphorus, Potassium, Gypsum", watering: "Every 8-10 days, avoid waterlogging", harvest: "Approx. 90-130 days" }
};

export default function CropModal({ isOpen, onClose, language }) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [customCrop, setCustomCrop] = useState('');
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCropData = async (cropName) => {
    setLoading(true);
    setCropData(null);

    try {
      const prompt = `Generate a JSON object of crop guidelines for "${cropName}". Return ONLY the raw JSON object, no markdown styling. Format:
      {"name": "${cropName}", "soil": "ideal soils description", "fertilizer": "recommended NPK fertilizers", "watering": "watering and irrigation instructions", "harvest": "harvest duration days/months"}`;
      
      const responseText = await askGemini(prompt, language);
      
      // Extract and Parse JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      setCropData(data);
    } catch (err) {
      console.warn("Gemini guide generation failed, falling back to static data:", err.message);
      // Try local fallback matching static crops keys
      const matchedKey = Object.keys(staticCrops).find(
        key => staticCrops[key].name.toLowerCase().includes(cropName.toLowerCase()) || key.includes(cropName.toLowerCase())
      );
      setCropData(staticCrops[matchedKey] || {
        name: cropName,
        soil: "Well-drained fertile soil",
        fertilizer: "NPK balanced fertilizers, compost",
        watering: "Water regularly based on soil moisture",
        harvest: "Approx. 90-120 days"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (e) => {
    const cropKey = e.target.value;
    setSelectedCrop(cropKey);
    setCustomCrop('');
    if (cropKey) {
      fetchCropData(staticCrops[cropKey].name);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customCrop.trim()) return;
    setSelectedCrop('');
    fetchCropData(customCrop.trim());
  };

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Crop Manager</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Dropdown Choice */}
          <div className="form-group">
            <label htmlFor="cropSelector">Select a Crop:</label>
            <select 
              id="cropSelector"
              value={selectedCrop}
              onChange={handleDropdownChange}
            >
              <option value="" disabled>-- Select a Crop --</option>
              {Object.keys(staticCrops).map(key => (
                <option key={key} value={key}>{staticCrops[key].name}</option>
              ))}
            </select>
          </div>

          {/* Custom Crop Input */}
          <form onSubmit={handleCustomSubmit} className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label>Or Type Custom Crop Name:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="e.g. Tomato, Mango, Betel Vine..." 
                value={customCrop}
                onChange={(e) => setCustomCrop(e.target.value)}
                style={{ flexGrow: 1 }}
              />
              <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '10px 15px', width: 'auto', whiteSpace: 'nowrap' }}>AI Guide</button>
            </div>
          </form>
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
              Select a crop from the list or type a custom crop to see its details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
