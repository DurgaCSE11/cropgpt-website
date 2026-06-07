import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const staticCrops = {
  rice: { name: "Rice (Paddy)", soil: "Clayey and loamy soils", fertilizer: "Nitrogen (Urea), Phosphorus, Potassium", watering: "Requires standing water (2-5 cm), frequent irrigation", harvest: "Approx. 90-120 days after planting" },
  maize: { name: "Maize (Corn)", soil: "Well-drained loamy soils", fertilizer: "High Nitrogen, Phosphorus", watering: "Once every 5-7 days during peak growth", harvest: "Approx. 60-100 days, when silks are dry" },
  sugarcane: { name: "Sugarcane", soil: "Loamy, well-drained soils", fertilizer: "NPK complex, pressmud", watering: "Frequent watering, especially during formative stage", harvest: "Approx. 10-18 months" },
  cotton: { name: "Cotton", soil: "Black cotton soil, well-drained", fertilizer: "Nitrogen and Phosphorus", watering: "Infrequent but deep watering", harvest: "Approx. 150-180 days" },
  groundnut: { name: "Groundnut (Peanut)", soil: "Sandy loam soils", fertilizer: "Phosphorus, Potassium, Gypsum", watering: "Every 8-10 days, avoid waterlogging", harvest: "Approx. 90-130 days" }
};

export default function CropModal({ isOpen, onClose }) {
  const [crops, setCrops] = useState({});
  const [selectedCropKey, setSelectedCropKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCrops();
    }
  }, [isOpen]);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert array to key-based object
        const cropObj = {};
        data.forEach(item => {
          cropObj[item.key_name] = {
            name: item.name,
            soil: item.soil,
            fertilizer: item.fertilizer,
            watering: item.watering,
            harvest: item.harvest
          };
        });
        setCrops(cropObj);
      } else {
        // Fallback to static
        setCrops(staticCrops);
      }
    } catch (err) {
      console.warn("Could not fetch crops from DB, using mock data:", err.message);
      setCrops(staticCrops);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const data = selectedCropKey ? crops[selectedCropKey] : null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Crop Manager</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading crop guidelines...</p>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="cropSelector">Select a Crop to get detailed information:</label>
              <select 
                id="cropSelector"
                value={selectedCropKey}
                onChange={(e) => setSelectedCropKey(e.target.value)}
              >
                <option value="" disabled>-- Select a Crop --</option>
                {Object.keys(crops).map(key => (
                  <option key={key} value={key}>{crops[key].name}</option>
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
          </>
        )}
      </div>
    </div>
  );
}
