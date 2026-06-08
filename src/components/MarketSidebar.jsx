import React, { useState, useEffect } from 'react';
import { askGemini } from '../geminiService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const stateData = {
  Odisha: [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", 
    "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", 
    "Kandhamal", "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", 
    "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"
  ],
  "West Bengal": ["Bankura", "Purulia", "Paschim Medinipur", "Purba Bardhaman", "Darjeeling", "Howrah"],
  "Andhra Pradesh": ["Visakhapatnam", "East Godavari", "West Godavari", "Chittoor", "Guntur", "Nellore"]
};

const getFallbackMarketData = (locationName) => {
  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const getVal = (min, max, offset) => {
    return Math.abs((hash + offset) % (max - min + 1)) + min;
  };

  const paddyPrice = getVal(2150, 2300, 12);
  const pulsesPrice = getVal(6800, 7500, 34);
  const oilseedPrice = getVal(6000, 6600, 56);

  const paddyDemand = getVal(70, 95, 10);
  const paddySupply = getVal(60, 90, 20);
  const pulsesDemand = getVal(50, 85, 30);
  const pulsesSupply = getVal(40, 80, 40);
  const oilseedDemand = getVal(45, 80, 50);
  const oilseedSupply = getVal(35, 75, 60);

  return {
    labels: ['Paddy', 'Pulses', 'Oilseeds'],
    datasets: [
      { label: 'Demand', data: [paddyDemand, pulsesDemand, oilseedDemand], backgroundColor: 'rgba(0, 221, 0, 0.6)', borderColor: 'rgba(0, 221, 0, 1)', borderWidth: 1 },
      { label: 'Supply', data: [paddySupply, pulsesSupply, oilseedSupply], backgroundColor: 'rgba(220, 53, 69, 0.6)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
    ],
    prices: [
      { crop: 'Paddy (Common)', price: `₹${paddyPrice}` },
      { crop: 'Arhar (Pulses)', price: `₹${pulsesPrice}` },
      { crop: 'Groundnut (Oilseed)', price: `₹${oilseedPrice}` }
    ]
  };
};

export default function MarketSidebar({ language }) {
  const [selectedState, setSelectedState] = useState('Odisha');
  const [selectedDistrict, setSelectedDistrict] = useState('Sambalpur');
  const [customLocation, setCustomLocation] = useState('');
  const [activeLocation, setActiveLocation] = useState('Sambalpur');
  const [activeData, setActiveData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update district dropdown when state changes
  useEffect(() => {
    const districts = stateData[selectedState] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
      setCustomLocation('');
      setActiveLocation(districts[0]);
    }
  }, [selectedState]);

  useEffect(() => {
    loadMarketData(activeLocation);
  }, [activeLocation, language]);

  const loadMarketData = async (locationName) => {
    setLoading(true);
    try {
      const prompt = `Generate a JSON object of mock market supply, demand, and prices for Paddy, Pulses, and Groundnuts in the location "${locationName}", State: "${selectedState}" in India. Return ONLY the raw JSON object, no markdown code block formatting. Follow this format:
      {
        "labels": ["Paddy", "Pulses", "Groundnuts"],
        "demand": [85, 60, 55],
        "supply": [75, 65, 50],
        "prices": [
          {"crop": "Paddy (Common)", "price": "₹2180"},
          {"crop": "Arhar (Pulses)", "price": "₹7100"},
          {"crop": "Groundnuts", "price": "₹6400"}
        ]
      }`;
      const responseText = await askGemini(prompt, language);
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
      
      setActiveData({
        labels: data.labels,
        datasets: [
          { label: 'Demand', data: data.demand, backgroundColor: 'rgba(0, 221, 0, 0.6)', borderColor: 'rgba(0, 221, 0, 1)', borderWidth: 1 },
          { label: 'Supply', data: data.supply, backgroundColor: 'rgba(220, 53, 69, 0.6)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
        ],
        prices: data.prices
      });
    } catch (err) {
      console.warn("Gemini market data generation failed, using static fallback:", err.message);
      setActiveData(getFallbackMarketData(locationName));
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (e) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    setCustomLocation('');
    setActiveLocation(dist);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customLocation.trim()) return;
    setActiveLocation(customLocation.trim());
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { labels: { boxWidth: 12 } }
    }
  };

  const districts = stateData[selectedState] || [];

  return (
    <aside className="right-sidebar neon-border">
      <div className="market-graph-container" style={{ height: 'auto', minHeight: '100%' }}>
        <h3>Market Data</h3>
        
        {/* State Selection */}
        <div className="form-group">
          <label>Select State:</label>
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {Object.keys(stateData).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* District Selection */}
        <div className="form-group">
          <label>Select District:</label>
          <select 
            id="districtMarketSelector"
            value={selectedDistrict}
            onChange={handleDropdownChange}
          >
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Custom Location Search Form */}
        <form onSubmit={handleCustomSubmit} className="form-group" style={{ marginBottom: '15px' }}>
          <label>Or Enter Custom Location:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="e.g. Cuttack, Bhubaneswar..." 
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              style={{ flexGrow: 1, padding: '8px' }}
            />
            <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '8px 12px', width: 'auto' }}>
              Go
            </button>
          </div>
        </form>

        <hr style={{ margin: '15px 0', borderColor: 'var(--border-color)' }} />

        <h4 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary-neon)' }}>
          {activeLocation} Index
        </h4>

        {loading ? (
          <p style={{ textAlign: 'center', margin: '40px 0', color: '#00dd00' }}>✨ AI updating market index...</p>
        ) : activeData ? (
          <>
            <div className="chart-wrapper">
              <Bar 
                data={{
                  labels: activeData.labels,
                  datasets: activeData.datasets
                }} 
                options={chartOptions} 
              />
            </div>
            
            <div id="marketPriceTableContainer" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Price/Quintal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeData.prices.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.crop}</td>
                      <td>{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', margin: '40px 0' }}>Select a district.</p>
        )}
      </div>
    </aside>
  );
}
