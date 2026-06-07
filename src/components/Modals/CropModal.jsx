import React, { useState } from 'react';

const cropData = {
  rice: {
    name: "Rice (Paddy)",
    soil: "Clayey and loamy soils",
    fertilizer: "Nitrogen (Urea), Phosphorus, Potassium",
    watering: "Requires standing water (2-5 cm), frequent irrigation",
    harvest: "Approx. 90-120 days after planting"
  },
  maize: {
    name: "Maize (Corn)",
    soil: "Well-drained loamy soils",
    fertilizer: "High Nitrogen, Phosphorus",
    watering: "Once every 5-7 days during peak growth",
    harvest: "Approx. 60-100 days, when silks are dry"
  },
  sugarcane: {
    name: "Sugarcane",
    soil: "Loamy, well-drained soils",
    fertilizer: "NPK complex, pressmud",
    watering: "Frequent watering, especially during formative stage",
    harvest: "Approx. 10-18 months"
  },
  cotton: {
    name: "Cotton",
    soil: "Black cotton soil, well-drained",
    fertilizer: "Nitrogen and Phosphorus",
    watering: "Infrequent but deep watering",
    harvest: "Approx. 150-180 days"
  },
  groundnut: {
    name: "Groundnut (Peanut)",
    soil: "Sandy loam soils",
    fertilizer: "Phosphorus, Potassium, Gypsum",
    watering: "Every 8-10 days, avoid waterlogging",
    harvest: "Approx. 90-130 days"
  }
};

export default function CropModal({ isOpen, onClose }) {
  const [selectedCrop, setSelectedCrop] = useState('');

  if (!isOpen) return null;

  const data = selectedCrop ? cropData[selectedCrop] : null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Crop Manager</h2>
        <div className="form-group">
          <label htmlFor="cropSelector">Select a Crop to get detailed information:</label>
          <select 
            id="cropSelector"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="" disabled>-- Select a Crop --</option>
            {Object.keys(cropData).map(key => (
              <option key={key} value={key}>{cropData[key].name}</option>
            ))}
          </select>
        </div>

        <div id="cropInfoDisplay">
          {data ? (
            <div>
              <h3>{data.name} Guide</h3>
              <div className="crop-info-grid">
                <div className="crop-info-item">
                  <strong>Soil Type:</strong> {data.soil}
                </div>
                <div className="crop-info-item">
                  <strong>Fertilizer:</strong> {data.fertilizer}
                </div>
                <div className="crop-info-item">
                  <strong>Watering:</strong> {data.watering}
                </div>
                <div className="crop-info-item">
                  <strong>Harvest Time:</strong> {data.harvest}
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
