import React, { useState, useEffect } from 'react';
import { askGemini } from '../geminiService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const staticMarketData = {
  Sambalpur: {
    labels: ['Paddy', 'Pulses', 'Oilseeds'],
    datasets: [
      { label: 'Demand', data: [85, 60, 50], backgroundColor: 'rgba(0, 221, 0, 0.6)', borderColor: 'rgba(0, 221, 0, 1)', borderWidth: 1 },
      { label: 'Supply', data: [75, 65, 45], backgroundColor: 'rgba(220, 53, 69, 0.6)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
    ],
    prices: [
      { crop: 'Paddy (Common)', price: '₹2183' },
      { crop: 'Arhar (Pulses)', price: '₹7000' },
      { crop: 'Groundnut (Oilseed)', price: '₹6377' }
    ]
  },
  Cuttack: {
    labels: ['Paddy', 'Jute', 'Sugarcane'],
    datasets: [
      { label: 'Demand', data: [90, 70, 60], backgroundColor: 'rgba(0, 221, 0, 0.6)', borderColor: 'rgba(0, 221, 0, 1)', borderWidth: 1 },
      { label: 'Supply', data: [80, 65, 65], backgroundColor: 'rgba(220, 53, 69, 0.6)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
    ],
    prices: [
      { crop: 'Paddy (Common)', price: '₹2190' },
      { crop: 'Jute', price: '₹5050' },
      { crop: 'Sugarcane', price: '₹3500' }
    ]
  },
  Bargarh: {
    labels: ['Paddy', 'Groundnut', 'Pulses'],
    datasets: [
      { label: 'Demand', data: [95, 55, 65], backgroundColor: 'rgba(0, 221, 0, 0.6)', borderColor: 'rgba(0, 221, 0, 1)', borderWidth: 1 },
      { label: 'Supply', data: [90, 50, 60], backgroundColor: 'rgba(220, 53, 69, 0.6)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
    ],
    prices: [
      { crop: 'Paddy (Grade A)', price: '₹2203' },
      { crop: 'Groundnut', price: '₹6400' },
      { crop: 'Mung (Pulses)', price: '₹8558' }
    ]
  }
};

const districtsList = ['Sambalpur', 'Cuttack', 'Bargarh', 'Puri', 'Koraput', 'Balasore'];

export default function MarketSidebar() {
  const [district, setDistrict] = useState('Sambalpur');
  const [activeData, setActiveData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarketData();
  }, [district]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a JSON object of mock market supply, demand, and prices for Paddy, Pulses, and Groundnuts in district "${district}" in Odisha. Return ONLY the raw JSON object, no markdown code block formatting. Follow this format:
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
      const responseText = await askGemini(prompt);
      
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
      console.warn("Gemini market data generation failed, using static data:", err.message);
      setActiveData(staticMarketData[district] || staticMarketData.Sambalpur);
    } finally {
      setLoading(false);
    }
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

  return (
    <aside className="right-sidebar neon-border">
      <div className="market-graph-container">
        <h3>Market Data</h3>
        
        <div className="form-group">
          <label htmlFor="districtMarketSelector">Select District:</label>
          <select 
            id="districtMarketSelector"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#00dd00' }}>✨ AI updating market index...</p>
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
            
            <div id="marketPriceTableContainer">
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
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Select a district.</p>
        )}
      </div>
    </aside>
  );
}
