import React, { useState } from 'react';

const odishaDistricts = [
  { name: "Angul", temp: "31°C", soil: "Red and Yellow, Laterite", idealCrops: "Rice, Pulses, Maize, Groundnut", wind: "10 km/h", humidity: "78%", rain: "40% chance of showers" },
  { name: "Balangir", temp: "32°C", soil: "Red and Laterite", idealCrops: "Rice, Cotton, Sugarcane, Maize", wind: "12 km/h", humidity: "75%", rain: "30% chance of rain" },
  { name: "Balasore", temp: "30°C", soil: "Coastal Alluvial, Saline", idealCrops: "Rice, Groundnut, Vegetables, Coconut", wind: "15 km/h", humidity: "82%", rain: "60% chance of thunderstorms" },
  { name: "Bargarh", temp: "32°C", soil: "Mixed Red and Black", idealCrops: "Rice, Pulses, Groundnut, Sugarcane", wind: "11 km/h", humidity: "76%", rain: "35% chance of rain" },
  { name: "Bhadrak", temp: "30°C", soil: "Alluvial, Saline", idealCrops: "Rice, Jute, Oilseeds", wind: "14 km/h", humidity: "83%", rain: "55% chance of showers" },
  { name: "Boudh", temp: "31°C", soil: "Red and Yellow", idealCrops: "Rice, Pulses, Oilseeds, Maize", wind: "9 km/h", humidity: "77%", rain: "40% chance of rain" },
  { name: "Cuttack", temp: "31°C", soil: "Alluvial, Laterite", idealCrops: "Rice, Jute, Sugarcane, Vegetables", wind: "13 km/h", humidity: "80%", rain: "50% chance of showers" },
  { name: "Deogarh", temp: "30°C", soil: "Red and Laterite", idealCrops: "Rice, Maize, Pulses, Turmeric", wind: "8 km/h", humidity: "79%", rain: "45% chance of rain" },
  { name: "Dhenkanal", temp: "31°C", soil: "Red Loamy, Laterite", idealCrops: "Rice, Mango, Cashew, Vegetables", wind: "10 km/h", humidity: "78%", rain: "40% chance of rain" },
  { name: "Gajapati", temp: "29°C", soil: "Hilly Red Soil, Laterite", idealCrops: "Maize, Cotton, Ginger, Turmeric", wind: "12 km/h", humidity: "81%", rain: "65% chance of heavy rain" },
  { name: "Ganjam", temp: "30°C", soil: "Coastal Alluvial, Red Loamy", idealCrops: "Rice, Sugarcane, Coconut, Groundnut", wind: "16 km/h", humidity: "84%", rain: "60% chance of showers" },
  { name: "Jagatsinghpur", temp: "30°C", soil: "Deltaic Alluvial, Saline", idealCrops: "Rice, Jute, Betel Vine, Sugarcane", wind: "15 km/h", humidity: "85%", rain: "55% chance of thunderstorms" },
  { name: "Jajpur", temp: "31°C", soil: "Alluvial", idealCrops: "Rice, Jute, Groundnut, Mung", wind: "13 km/h", humidity: "82%", rain: "50% chance of rain" },
  { name: "Jharsuguda", temp: "32°C", soil: "Red and Yellow", idealCrops: "Rice, Pulses, Groundnut", wind: "10 km/h", humidity: "74%", rain: "30% chance of rain" },
  { name: "Kalahandi", temp: "31°C", soil: "Black and Red", idealCrops: "Rice, Cotton, Maize, Pulses", wind: "11 km/h", humidity: "76%", rain: "35% chance of rain" },
  { name: "Kandhamal", temp: "28°C", soil: "Brown Forest, Red Loamy", idealCrops: "Turmeric, Ginger, Maize, Pulses", wind: "9 km/h", humidity: "80%", rain: "70% chance of rain" },
  { name: "Kendrapara", temp: "30°C", soil: "Coastal Alluvial, Saline", idealCrops: "Rice, Jute, Coconut, Vegetables", wind: "14 km/h", humidity: "86%", rain: "60% chance of showers" },
  { name: "Kendujhar (Keonjhar)", temp: "29°C", soil: "Red Soil, Laterite", idealCrops: "Rice, Maize, Pulses, Mango", wind: "8 km/h", humidity: "79%", rain: "50% chance of rain" },
  { name: "Khordha", temp: "31°C", soil: "Laterite, Alluvial", idealCrops: "Rice, Cashew, Coconut, Vegetables", wind: "14 km/h", humidity: "81%", rain: "45% chance of thunderstorms" },
  { name: "Koraput", temp: "27°C", soil: "Red Loamy, Brown Forest", idealCrops: "Coffee, Ginger, Millets, Vegetables", wind: "10 km/h", humidity: "83%", rain: "75% chance of rain" },
  { name: "Malkangiri", temp: "30°C", soil: "Red and Laterite", idealCrops: "Rice, Maize, Pulses, Oilseeds", wind: "9 km/h", humidity: "80%", rain: "65% chance of rain" },
  { name: "Mayurbhanj", temp: "29°C", soil: "Red Loamy, Laterite", idealCrops: "Rice, Sabai Grass, Pulses, Groundnut", wind: "10 km/h", humidity: "82%", rain: "55% chance of showers" },
  { name: "Nabarangpur", temp: "29°C", soil: "Laterite, Red Sandy", idealCrops: "Maize, Rice, Millets, Pulses", wind: "8 km/h", humidity: "78%", rain: "60% chance of rain" },
  { name: "Nayagarh", temp: "31°C", soil: "Red and Laterite", idealCrops: "Rice, Sugarcane, Pulses, Mango", wind: "12 km/h", humidity: "79%", rain: "40% chance of rain" },
  { name: "Nuapada", temp: "32°C", soil: "Red and Yellow", idealCrops: "Rice, Maize, Pulses, Groundnut", wind: "10 km/h", humidity: "75%", rain: "30% chance of rain" },
  { name: "Puri", temp: "30°C", soil: "Coastal Alluvial, Sandy", idealCrops: "Rice, Coconut, Casuarina, Vegetables", wind: "17 km/h", humidity: "85%", rain: "65% chance of showers" },
  { name: "Rayagada", temp: "29°C", soil: "Hilly Red and Black", idealCrops: "Cotton, Maize, Millets, Pineapple", wind: "11 km/h", humidity: "81%", rain: "70% chance of rain" },
  { name: "Sambalpur", temp: "32°C", soil: "Red and Yellow", idealCrops: "Rice, Pulses, Oilseeds, Sugarcane", wind: "11 km/h", humidity: "77%", rain: "35% chance of rain" },
  { name: "Subarnapur (Sonepur)", temp: "32°C", soil: "Alluvial, Red and Black", idealCrops: "Rice, Pulses, Groundnut, Cotton", wind: "10 km/h", humidity: "76%", rain: "30% chance of rain" },
  { name: "Sundargarh", temp: "30°C", soil: "Red Loamy, Laterite", idealCrops: "Rice, Groundnut, Vegetables, Pulses", wind: "9 km/h", humidity: "78%", rain: "45% chance of rain" }
];

export default function WeatherModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const matchedDistrict = searchTerm.trim() 
    ? odishaDistricts.find(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        
        <div id="weatherResultsContainer">
          {matchedDistrict ? (
            <div>
              <h3>{matchedDistrict.name}</h3>
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
      </div>
    </div>
  );
}
