import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { askGemini } from '../../geminiService';

export default function AdminCockpitModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('weather');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  // Weather Table Data & Form
  const [weatherList, setWeatherList] = useState([]);
  const [wDistrict, setWDistrict] = useState('');
  const [wTemp, setWTemp] = useState('');
  const [wSoil, setWSoil] = useState('');
  const [wIdealCrops, setWIdealCrops] = useState('');
  const [wWind, setWWind] = useState('');
  const [wHumidity, setWHumidity] = useState('');
  const [wRain, setWRain] = useState('');

  // Market Table Data & Form
  const [marketList, setMarketList] = useState([]);
  const [mDistrict, setMDistrict] = useState('');
  const [mCrop, setMCrop] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mDemand, setMDemand] = useState(50);
  const [mSupply, setMSupply] = useState(50);

  // Crops Table Data & Form
  const [cropList, setCropList] = useState([]);
  const [cKey, setCKey] = useState('');
  const [cName, setCName] = useState('');
  const [cSoil, setCSoil] = useState('');
  const [cFertilizer, setCFertilizer] = useState('');
  const [cWatering, setCWatering] = useState('');
  const [cHarvest, setCHarvest] = useState('');

  // Schemes Table Data & Form
  const [schemeList, setSchemeList] = useState([]);
  const [sTitle, setSTitle] = useState('');
  const [sDescription, setSDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTabRecords();
    }
  }, [isOpen, activeTab]);

  const loadTabRecords = async () => {
    setLoading(true);
    try {
      if (activeTab === 'weather') {
        const { data, error } = await supabase.from('weather_advisories').select('*').order('district');
        if (error) throw error;
        setWeatherList(data || []);
      } else if (activeTab === 'market') {
        const { data, error } = await supabase.from('market_prices').select('*').order('district');
        if (error) throw error;
        setMarketList(data || []);
      } else if (activeTab === 'crops') {
        const { data, error } = await supabase.from('crops').select('*').order('name');
        if (error) throw error;
        setCropList(data || []);
      } else if (activeTab === 'schemes') {
        const { data, error } = await supabase.from('schemes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setSchemeList(data || []);
      }
    } catch (err) {
      console.error("Fetch records error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (table, id) => {
    if (!window.confirm(`Delete this record from ${table}?`)) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      loadTabRecords();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Helper parser for Gemini JSON responses
  const extractJSON = (text) => {
    try {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON parsing failed for text:", text);
      throw new Error("AI responded with invalid format. Please try again.");
    }
  };

  // AI POPULATE HANDLER (Option B)
  const handleAiPopulate = async () => {
    if (!window.confirm("This will auto-populate your database tables with AI-generated agricultural data for Odisha. Continue?")) return;
    
    setAiLoading(true);
    setAiStatus('Starting AI generation...');

    try {
      // 1. Generate Crops Guidelines
      setAiStatus('Generating crops guidelines with Gemini...');
      const cropPrompt = `Generate a JSON array of exactly 5 crops common in Odisha (Rice, Maize, Sugarcane, Cotton, Groundnut). Return ONLY the raw JSON array. Do not include markdown code block formatting. Follow this format:
      [
        {"key_name": "rice", "name": "Rice (Paddy)", "soil": "Clayey and loamy soils", "fertilizer": "Nitrogen (Urea), Phosphorus, Potassium", "watering": "Requires standing water (2-5 cm), frequent irrigation", "harvest": "Approx. 90-120 days after planting"},
        ...
      ]`;
      const cropText = await askGemini(cropPrompt);
      const cropData = extractJSON(cropText);
      
      setAiStatus('Saving crop guides to Supabase...');
      for (const item of cropData) {
        await supabase.from('crops').upsert(item, { onConflict: 'key_name' });
      }

      // 2. Generate Weather Advisories
      setAiStatus('Generating regional weather advisories...');
      const weatherPrompt = `Generate a JSON array of weather and soil reports for 5 districts in Odisha (Sambalpur, Cuttack, Bargarh, Puri, Koraput). Return ONLY the raw JSON array. Format:
      [
        {"district": "Sambalpur", "temp": "32°C", "soil": "Red and Yellow soil", "ideal_crops": "Rice, Pulses, Sugarcane", "wind": "11 km/h", "humidity": "77%", "rain": "35% chance of rain"},
        ...
      ]`;
      const weatherText = await askGemini(weatherPrompt);
      const weatherData = extractJSON(weatherText);

      setAiStatus('Saving weather reports to Supabase...');
      for (const item of weatherData) {
        await supabase.from('weather_advisories').upsert(item, { onConflict: 'district' });
      }

      // 3. Generate Market Prices
      setAiStatus('Generating crop market prices...');
      const marketPrompt = `Generate a JSON array of market supply, demand, and prices for Paddy, Pulses, Jute, and Groundnuts in Sambalpur, Cuttack, and Bargarh. Return ONLY the raw JSON array. Format:
      [
        {"district": "Sambalpur", "crop": "Paddy", "price": "₹2183", "demand": 85, "supply": 75},
        ...
      ]`;
      const marketText = await askGemini(marketPrompt);
      const marketData = extractJSON(marketText);

      setAiStatus('Saving market prices to Supabase...');
      // Clear old prices to prevent duplicate records
      await supabase.from('market_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      for (const item of marketData) {
        await supabase.from('market_prices').insert(item);
      }

      // 4. Generate Govt Schemes
      setAiStatus('Generating Odisha agricultural schemes...');
      const schemePrompt = `Generate a JSON array of 4 popular government schemes for farmers in Odisha (like KALIA, PM-KISAN, Balaram, OMM). Return ONLY the raw JSON array. Format:
      [
        {"title": "KALIA Scheme", "description": "Provides financial assistance of ₹10,000 per year to small and marginal farmers..."},
        ...
      ]`;
      const schemeText = await askGemini(schemePrompt);
      const schemeData = extractJSON(schemeText);

      setAiStatus('Saving government schemes to Supabase...');
      // Clear old schemes
      await supabase.from('schemes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      for (const item of schemeData) {
        await supabase.from('schemes').insert(item);
      }

      setAiStatus('');
      alert("✨ Database successfully populated with AI data! Refreshing dashboard...");
      loadTabRecords();

    } catch (err) {
      alert("AI Generation failed: " + err.message);
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Weather Form Submit
  const handleAddWeather = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('weather_advisories').upsert({
        district: wDistrict.trim(),
        temp: wTemp.trim(),
        soil: wSoil.trim(),
        ideal_crops: wIdealCrops.trim(),
        wind: wWind.trim(),
        humidity: wHumidity.trim(),
        rain: wRain.trim()
      }, { onConflict: 'district' });

      if (error) throw error;
      setWDistrict('');
      setWTemp('');
      setWSoil('');
      setWIdealCrops('');
      setWWind('');
      setWHumidity('');
      setWRain('');
      loadTabRecords();
      alert("Weather advisory saved successfully!");
    } catch (err) {
      alert("Submit failed: " + err.message);
    }
  };

  // Market Form Submit
  const handleAddMarket = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('market_prices').insert({
        district: mDistrict.trim(),
        crop: mCrop.trim(),
        price: mPrice.trim(),
        demand: parseInt(mDemand),
        supply: parseInt(mSupply)
      });

      if (error) throw error;
      setMDistrict('');
      setMCrop('');
      setMPrice('');
      setMDemand(50);
      setMSupply(50);
      loadTabRecords();
      alert("Market price row inserted successfully!");
    } catch (err) {
      alert("Submit failed: " + err.message);
    }
  };

  // Crop Form Submit
  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('crops').upsert({
        key_name: cKey.trim().toLowerCase(),
        name: cName.trim(),
        soil: cSoil.trim(),
        fertilizer: cFertilizer.trim(),
        watering: cWatering.trim(),
        harvest: cHarvest.trim()
      }, { onConflict: 'key_name' });

      if (error) throw error;
      setCKey('');
      setCName('');
      setCSoil('');
      setCFertilizer('');
      setCWatering('');
      setCHarvest('');
      loadTabRecords();
      alert("Crop guideline saved successfully!");
    } catch (err) {
      alert("Submit failed: " + err.message);
    }
  };

  // Scheme Form Submit
  const handleAddScheme = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('schemes').insert({
        title: sTitle.trim(),
        description: sDescription.trim()
      });

      if (error) throw error;
      setSTitle('');
      setSDescription('');
      loadTabRecords();
      alert("Govt Scheme published successfully!");
    } catch (err) {
      alert("Submit failed: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-lg show">
      <div 
        className="modal-content neon-border" 
        style={{ 
          maxWidth: '950px', 
          backgroundColor: '#0f0f15', 
          color: '#ffffff',
          borderRadius: '15px' 
        }}
      >
        <span className="close-btn" onClick={onClose} style={{ color: '#ffffff' }}>&times;</span>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ color: '#00dd00', textShadow: '0 0 10px rgba(0, 221, 0, 0.8)', fontSize: '1.8rem', margin: 0 }}>
              🛰️ CropGPT Cockpit Control Room
            </h2>
            <p style={{ color: '#888899', fontSize: '0.85rem', marginTop: '3px' }}>Administrator Console for dynamic database records</p>
          </div>
          
          <div>
            <button
              onClick={handleAiPopulate}
              disabled={aiLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: aiLoading ? '#333' : '#00dd00',
                color: aiLoading ? '#999' : '#000000',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
                boxShadow: aiLoading ? 'none' : '0 0 10px rgba(0, 221, 0, 0.5)',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {aiLoading ? '✨ Populating...' : '✨ Populate DB with AI'}
            </button>
          </div>
        </div>

        {aiLoading && (
          <div style={{ backgroundColor: 'rgba(0, 221, 0, 0.1)', border: '1px dashed #00dd00', padding: '10px 15px', borderRadius: '5px', marginBottom: '20px', color: '#00dd00', fontWeight: '500', fontSize: '0.9rem', textAlign: 'center' }}>
            ⏳ {aiStatus}
          </div>
        )}

        {/* Console Tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #222233', paddingBottom: '10px', marginBottom: '20px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('weather')}
            style={{
              padding: '10px 15px',
              backgroundColor: activeTab === 'weather' ? '#00dd00' : '#1c1c28',
              color: activeTab === 'weather' ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            🌤️ Weather Advisories
          </button>
          <button 
            onClick={() => setActiveTab('market')}
            style={{
              padding: '10px 15px',
              backgroundColor: activeTab === 'market' ? '#00dd00' : '#1c1c28',
              color: activeTab === 'market' ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            📊 Market Indexer
          </button>
          <button 
            onClick={() => setActiveTab('crops')}
            style={{
              padding: '10px 15px',
              backgroundColor: activeTab === 'crops' ? '#00dd00' : '#1c1c28',
              color: activeTab === 'crops' ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            🌾 Crops Guide
          </button>
          <button 
            onClick={() => setActiveTab('schemes')}
            style={{
              padding: '10px 15px',
              backgroundColor: activeTab === 'schemes' ? '#00dd00' : '#1c1c28',
              color: activeTab === 'schemes' ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            📜 Schemes Publisher
          </button>
        </div>

        {/* Split Grid for Admin operations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '5px' }}>
          
          {/* LEFT: Forms Panel */}
          <div style={{ backgroundColor: '#161622', padding: '20px', borderRadius: '10px', border: '1px solid #222233' }}>
            <h3 style={{ color: '#00dd00', marginBottom: '15px', borderBottom: '1px solid #222233', paddingBottom: '8px' }}>
              Add/Edit Entry
            </h3>

            {activeTab === 'weather' && (
              <form onSubmit={handleAddWeather}>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>District Name</label>
                  <input type="text" placeholder="e.g. Sambalpur" value={wDistrict} onChange={e => setWDistrict(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Temperature</label>
                  <input type="text" placeholder="e.g. 32°C" value={wTemp} onChange={e => setWTemp(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Soil Classification</label>
                  <input type="text" placeholder="e.g. Clayey Alluvial" value={wSoil} onChange={e => setWSoil(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Ideal Crops</label>
                  <input type="text" placeholder="e.g. Paddy, Groundnut" value={wIdealCrops} onChange={e => setWIdealCrops(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Wind advisory</label>
                  <input type="text" placeholder="e.g. 12 km/h" value={wWind} onChange={e => setWWind(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Humidity percentage</label>
                  <input type="text" placeholder="e.g. 78%" value={wHumidity} onChange={e => setWHumidity(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Rain Warning</label>
                  <input type="text" placeholder="e.g. Heavy thunderstorms expected" value={wRain} onChange={e => setWRain(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <button type="submit" className="form-submit-btn">Save Weather advisory</button>
              </form>
            )}

            {activeTab === 'market' && (
              <form onSubmit={handleAddMarket}>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>District</label>
                  <input type="text" placeholder="e.g. Cuttack" value={mDistrict} onChange={e => setMDistrict(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Crop Name</label>
                  <input type="text" placeholder="e.g. Paddy" value={mCrop} onChange={e => setMCrop(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Price Per Quintal (₹)</label>
                  <input type="text" placeholder="e.g. ₹2190" value={mPrice} onChange={e => setMPrice(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Demand rating (0-100) : {mDemand}</label>
                  <input type="range" min="0" max="100" value={mDemand} onChange={e => setMDemand(e.target.value)} style={{ width: '100%', accentColor: '#00dd00' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Supply rating (0-100) : {mSupply}</label>
                  <input type="range" min="0" max="100" value={mSupply} onChange={e => setMSupply(e.target.value)} style={{ width: '100%', accentColor: '#00dd00' }} />
                </div>
                <button type="submit" className="form-submit-btn">Insert Market row</button>
              </form>
            )}

            {activeTab === 'crops' && (
              <form onSubmit={handleAddCrop}>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Unique Crop Key</label>
                  <input type="text" placeholder="e.g. rice (lowercase, no spaces)" value={cKey} onChange={e => setCKey(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Crop Display Name</label>
                  <input type="text" placeholder="e.g. Rice (Paddy)" value={cName} onChange={e => setCName(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Ideal Soils</label>
                  <input type="text" placeholder="e.g. Clayey loam" value={cSoil} onChange={e => setCSoil(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Recommended Fertilizers</label>
                  <input type="text" placeholder="e.g. Urea NPK" value={cFertilizer} onChange={e => setCFertilizer(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Watering instructions</label>
                  <input type="text" placeholder="e.g. Keep standing water" value={cWatering} onChange={e => setCWatering(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Harvest Days</label>
                  <input type="text" placeholder="e.g. 90-120 days" value={cHarvest} onChange={e => setCHarvest(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <button type="submit" className="form-submit-btn">Save Crop guide</button>
              </form>
            )}

            {activeTab === 'schemes' && (
              <form onSubmit={handleAddScheme}>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Scheme Title</label>
                  <input type="text" placeholder="e.g. KALIA assistance program" value={sTitle} onChange={e => setSTitle(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#aaa' }}>Description</label>
                  <textarea placeholder="Write scheme details here..." rows="5" value={sDescription} onChange={e => setSDescription(e.target.value)} required style={{ backgroundColor: '#0f0f15', color: '#fff', border: '1px solid #333' }}></textarea>
                </div>
                <button type="submit" className="form-submit-btn">Publish Scheme</button>
              </form>
            )}
          </div>

          {/* RIGHT: Ledger (Database Listings) Panel */}
          <div style={{ padding: '5px' }}>
            <h3 style={{ color: '#aaa', marginBottom: '15px', borderBottom: '1px solid #222233', paddingBottom: '8px' }}>
              Database Ledger
            </h3>

            {loading ? (
              <p style={{ color: '#888899' }}>Retrieving records...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeTab === 'weather' && (
                  weatherList.length === 0 ? <p style={{ color: '#888899' }}>No database entries</p> :
                  weatherList.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#1c1c28', borderRadius: '5px', border: '1px solid #222233' }}>
                      <div>
                        <strong style={{ color: '#00dd00' }}>{item.district}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '3px' }}>
                          Temp: {item.temp} | Rain: {item.rain}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteRecord('weather_advisories', item.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  ))
                )}

                {activeTab === 'market' && (
                  marketList.length === 0 ? <p style={{ color: '#888899' }}>No database entries</p> :
                  marketList.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#1c1c28', borderRadius: '5px', border: '1px solid #222233' }}>
                      <div>
                        <strong style={{ color: '#00dd00' }}>{item.district} - {item.crop}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '3px' }}>
                          Price: {item.price} | Demand: {item.demand}% | Supply: {item.supply}%
                        </div>
                      </div>
                      <button onClick={() => handleDeleteRecord('market_prices', item.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  ))
                )}

                {activeTab === 'crops' && (
                  cropList.length === 0 ? <p style={{ color: '#888899' }}>No database entries</p> :
                  cropList.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#1c1c28', borderRadius: '5px', border: '1px solid #222233' }}>
                      <div>
                        <strong style={{ color: '#00dd00' }}>{item.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '3px' }}>
                          Key: {item.key_name} | Soils: {item.soil}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteRecord('crops', item.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  ))
                )}

                {activeTab === 'schemes' && (
                  schemeList.length === 0 ? <p style={{ color: '#888899' }}>No database entries</p> :
                  schemeList.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#1c1c28', borderRadius: '5px', border: '1px solid #222233' }}>
                      <div style={{ paddingRight: '10px', flex: 1 }}>
                        <strong style={{ color: '#00dd00', fontSize: '0.95rem' }}>{item.title}</strong>
                        <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.description}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteRecord('schemes', item.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
