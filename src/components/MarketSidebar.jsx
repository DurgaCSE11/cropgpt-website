import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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

export default function MarketSidebar() {
  const [district, setDistrict] = useState('Sambalpur');
  const [marketList, setMarketList] = useState([]);
  const [districtsList, setDistrictsList] = useState(['Sambalpur', 'Cuttack', 'Bargarh']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarketPrices();
  }, []);

  const loadMarketPrices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setMarketList(data);
        
        // Extract unique districts
        const uniq = Array.from(new Set(data.map(item => item.district)));
        setDistrictsList(uniq);
        if (!uniq.includes(district) && uniq.length > 0) {
          setDistrict(uniq[0]);
        }
      } else {
        setMarketList([]);
      }
    } catch (err) {
      console.warn("Could not fetch market prices, using mock datasets:", err.message);
      setMarketList([]);
    } finally {
      setLoading(false);
    }
  };

  // Compile active data structures
  let activeData = null;

  if (marketList.length > 0) {
    const filtered = marketList.filter(item => item.district === district);
    const labels = filtered.map(item => item.crop);
    const demandData = filtered.map(item => item.demand);
    const supplyData = filtered.map(item => item.supply);
    const prices = filtered.map(item => ({ crop: item.crop, price: item.price }));

    activeData = {
      labels,
      datasets: [
        { label: 'Demand', data: demandData, backgroundColor: 'rgba(0, 221, 0, 0.6)', borderColor: 'rgba(0, 221, 0, 1)', borderWidth: 1 },
        { label: 'Supply', data: supplyData, backgroundColor: 'rgba(220, 53, 69, 0.6)', borderColor: 'rgba(220, 53, 69, 1)', borderWidth: 1 }
      ],
      prices
    };
  } else {
    activeData = staticMarketData[district] || staticMarketData.Sambalpur;
  }

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
        
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading market indexes...</p>
        ) : (
          <>
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
        )}
      </div>
    </aside>
  );
}
