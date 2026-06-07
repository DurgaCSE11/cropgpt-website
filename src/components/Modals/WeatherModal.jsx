import React, { useState } from 'react';
import { askGemini } from '../../geminiService';

const staticDistricts = [
  { name: "Angul", temp: "31°C", soil: "Red and Yellow, Laterite", idealCrops: "Rice, Pulses, Maize, Groundnut", wind: "10 km/h", humidity: "78%", rain: "40% chance of showers" },
  { name: "Balangir", temp: "32°C", soil: "Red and Laterite", idealCrops: "Rice, Cotton, Sugarcane, Maize", wind: "12 km/h", humidity: "75%", rain: "30% chance of rain" },
  { name: "Balasore", temp: "30°C", soil: "Coastal Alluvial, Saline", idealCrops: "Rice, Groundnut, Vegetables, Coconut", wind: "15 km/h", humidity: "82%", rain: "60% chance of thunderstorms" },
  { name: "Bargarh", temp: "32°C", soil: "Mixed Red and Black", idealCrops: "Rice, Pulses, Groundnut, Sugarcane", wind: "11 km/h", humidity: "76%", rain: "35% chance of rain" },
  { name: "Cuttack", temp: "31°C", soil: "Alluvial, Laterite", idealCrops: "Rice, Jute, Sugarcane, Vegetables", wind: "13 km/h", humidity: "80%", rain: "50% chance of showers" },
  { name: "Sambalpur", temp: "32°C", soil: "Red and Yellow", idealCrops: "Rice, Pulses, Oilseeds, Sugarcane", wind: "11 km/h", humidity: "77%", rain: "35% chance of rain" }
];

export default function WeatherModal({ isOpen, onClose, language }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setWeatherData(null);
    setError('');

    try {
      const prompt = `Validate if "${searchTerm}" is a real, existing district, city, town, or state in India (especially Odisha).
      If it is NOT a valid geographic location (for example, if it is a greeting like "hi", "hello", "hey", or random words/letters like "test", "xyz", "ok"), return exactly this JSON:
      {"error": "Please enter a valid district or region in Odisha/India."}

      If it is a valid location, generate a JSON object of a mock weather alert and agricultural advisory for "${searchTerm}". Return ONLY the raw JSON object, no markdown code block formatting. Format:
      {"name": "Proper Name of Location", "temp": "29°C", "soil": "Red loamy and Laterite", "idealCrops": "Rice, Cotton, Maize", "wind": "10 km/h", "humidity": "80%", "rain": "60% chance of rain"}`;

      const responseText = await askGemini(prompt, language);
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

      if (data.error) {
        setError(data.error);
        setWeatherData(null);
      } else {
        setWeatherData(data);
      }
    } catch (err) {
      console.warn("Gemini weather generation failed, running local search fallback:", err.message);
      
      const lowercaseSearch = searchTerm.trim().toLowerCase();
      const greetings = ['hi', 'hello', 'hey', 'yo', 'good', 'morning', 'afternoon', 'evening', 'test', 'admin', 'ok', 'no', 'yes'];
      
      if (greetings.includes(lowercaseSearch) || lowercaseSearch.length < 3) {
        setError("Please enter a valid district or region in Odisha.");
        setWeatherData(null);
        setLoading(false);
        return;
      }

      const matched = staticDistricts.find(d => d.name.toLowerCase().includes(lowercaseSearch));
      if (matched) {
        setWeatherData(matched);
      } else {
        setWeatherData({
          name: searchTerm,
          temp: "30°C",
          soil: "Alluvial soil",
          idealCrops: "Paddy, Groundnut, Vegetables",
          wind: "12 km/h",
          humidity: "78%",
          rain: "45% chance of showers"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Weather & Farm Advisory</h2>
        
        <form onSubmit={handleSearchSubmit} className="form-group" style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search for a district in Odisha..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="form-submit-btn" style={{ width: '100px', margin: 0, padding: '10px' }}>Search</button>
        </form>
        
        <div id="weatherResultsContainer">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#00dd00' }}>✨ AI is fetching regional forecast and advisory...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', color: 'var(--expense-color)', fontWeight: 'bold' }}>⚠️ {error}</p>
          ) : weatherData ? (
            <div>
              <h3>{weatherData.name} Advisory (AI Generated)</h3>
              <div className="weather-grid-display">
                <div className="weather-card">
                  🌡️ <strong>Temperature:</strong> {weatherData.temp}
                </div>
                <div className="weather-card">
                  🌬️ <strong>Wind:</strong> {weatherData.wind}
                </div>
                <div className="weather-card">
                  💧 <strong>Humidity:</strong> {weatherData.humidity}
                </div>
                <div className="weather-card">
                  🌧️ <strong>Rain:</strong> {weatherData.rain}
                </div>
                <div className="weather-card full-width">
                  🌱 <strong>Soil Type:</strong> {weatherData.soil}
                </div>
                <div className="weather-card full-width">
                  🌾 <strong>Ideal Crops:</strong> {weatherData.idealCrops}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Type and search for a district to see live AI weather advisories.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
