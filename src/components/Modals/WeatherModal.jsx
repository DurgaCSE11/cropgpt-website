import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const staticDistricts = [
  { name: "Angul", temp: "31°C", soil: "Red and Yellow, Laterite", idealCrops: "Rice, Pulses, Maize, Groundnut", wind: "10 km/h", humidity: "78%", rain: "40% chance of showers" },
  { name: "Balangir", temp: "32°C", soil: "Red and Laterite", idealCrops: "Rice, Cotton, Sugarcane, Maize", wind: "12 km/h", humidity: "75%", rain: "30% chance of rain" },
  { name: "Balasore", temp: "30°C", soil: "Coastal Alluvial, Saline", idealCrops: "Rice, Groundnut, Vegetables, Coconut", wind: "15 km/h", humidity: "82%", rain: "60% chance of thunderstorms" },
  { name: "Bargarh", temp: "32°C", soil: "Mixed Red and Black", idealCrops: "Rice, Pulses, Groundnut, Sugarcane", wind: "11 km/h", humidity: "76%", rain: "35% chance of rain" },
  { name: "Bhadrak", temp: "30°C", soil: "Alluvial, Saline", idealCrops: "Rice, Jute, Oilseeds", wind: "14 km/h", humidity: "83%", rain: "55% chance of showers" },
  { name: "Cuttack", temp: "31°C", soil: "Alluvial, Laterite", idealCrops: "Rice, Jute, Sugarcane, Vegetables", wind: "13 km/h", humidity: "80%", rain: "50% chance of showers" },
  { name: "Sambalpur", temp: "32°C", soil: "Red and Yellow", idealCrops: "Rice, Pulses, Oilseeds, Sugarcane", wind: "11 km/h", humidity: "77%", rain: "35% chance of rain" }
];

export default function WeatherModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWeather();
    }
  }, [isOpen]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weather_advisories')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Map DB attributes to match UI
        const mapped = data.map(item => ({
          name: item.district,
          temp: item.temp,
          soil: item.soil,
          idealCrops: item.ideal_crops,
          wind: item.wind,
          humidity: item.humidity,
          rain: item.rain
        }));
        setDistricts(mapped);
      } else {
        setDistricts(staticDistricts);
      }
    } catch (err) {
      console.warn("Could not fetch weather from DB, using mock data:", err.message);
      setDistricts(staticDistricts);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const matchedDistrict = searchTerm.trim() 
    ? districts.find(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Weather & Farm Advisory</h2>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Search for a district in Odisha..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading advisory report...</p>
        ) : (
          <div id="weatherResultsContainer">
            {matchedDistrict ? (
              <div>
                <h3>{matchedDistrict.name} Advisory</h3>
                <div className="weather-grid-display">
                  <div className="weather-card">
                    🌡️ <strong>Temperature:</strong> {matchedDistrict.temp}
                  </div>
                  <div className="weather-card">
                    🌬️ <strong>Wind:</strong> {matchedDistrict.wind}
                  </div>
                  <div className="weather-card">
                    💧 <strong>Humidity:</strong> {matchedDistrict.humidity}
                  </div>
                  <div className="weather-card">
                    🌧️ <strong>Rain:</strong> {matchedDistrict.rain}
                  </div>
                  <div className="weather-card full-width">
                    🌱 <strong>Soil Type:</strong> {matchedDistrict.soil}
                  </div>
                  <div className="weather-card full-width">
                    🌾 <strong>Ideal Crops:</strong> {matchedDistrict.idealCrops}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                {searchTerm.trim() ? `No district found matching "${searchTerm}"` : 'Search for a district to see details.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
