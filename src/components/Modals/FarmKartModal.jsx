import React, { useState } from 'react';
import { askGemini } from '../../geminiService';

const farmProducts = [
  { 
    name: 'Urea Fertilizer (45kg Bag)', 
    price: '₹266', 
    image: 'https://placehold.co/200x150/28a745/ffffff?text=Urea', 
    url: 'https://www.amazon.in/s?k=urea+fertilizer+for+plants' 
  },
  { 
    name: 'Organic Vermicompost (5kg)', 
    price: '₹299', 
    image: 'https://placehold.co/200x150/8B4513/ffffff?text=Compost', 
    url: 'https://www.amazon.in/s?k=vermicompost+organic+fertilizer' 
  },
  { 
    name: 'Paddy Seeds (1kg)', 
    price: '₹150', 
    image: 'https://placehold.co/200x150/DAA520/ffffff?text=Seeds', 
    url: 'https://www.amazon.in/s?k=paddy+seeds+for+sowing' 
  },
  { 
    name: 'Gardening Tool Set', 
    price: '₹499', 
    image: 'https://placehold.co/200x150/696969/ffffff?text=Tools', 
    url: 'https://www.amazon.in/s?k=gardening+tool+set' 
  },
  { 
    name: 'Neem Oil Pesticide (1L)', 
    price: '₹550', 
    image: 'https://placehold.co/200x150/556B2F/ffffff?text=Neem+Oil', 
    url: 'https://www.amazon.in/s?k=neem+oil+pest+control' 
  },
  { 
    name: 'Water Sprayer Pump (2L)', 
    price: '₹349', 
    image: 'https://placehold.co/200x150/4682B4/ffffff?text=Sprayer', 
    url: 'https://www.amazon.in/s?k=water+sprayer+pump+for+gardening' 
  }
];

export default function FarmKartModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearchResults([]);

    try {
      const prompt = `Generate a JSON array of up to 4 specific, real-world agricultural or farming products matching the search query: "${searchTerm}".
      For each product, generate:
      1. A descriptive name including brand or size if applicable.
      2. An estimated/reasonable price in INR (e.g. ₹399).
      3. A valid Amazon search URL: "https://www.amazon.in/s?k=[encoded_query]"
      4. A valid Flipkart search URL: "https://www.flipkart.com/search?q=[encoded_query]"

      Return ONLY the raw JSON array. Do not include markdown code block formatting. Follow this format exactly:
      [
        {"name": "Product Name", "price": "₹399", "amazonUrl": "https://www.amazon.in/s?k=...", "flipkartUrl": "https://www.flipkart.com/search?q=..."}
      ]`;

      const responseText = await askGemini(prompt);
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

      const formattedResults = data.map(p => ({
        ...p,
        image: `https://placehold.co/200x150/1c1c28/ffffff?text=${encodeURIComponent(p.name)}`
      }));
      setSearchResults(formattedResults);
    } catch (err) {
      console.warn("Gemini FarmKart search failed, building local search fallback:", err.message);
      
      const encoded = encodeURIComponent(searchTerm);
      setSearchResults([
        {
          name: `${searchTerm} (Amazon/Flipkart Search)`,
          price: 'Check prices online',
          image: `https://placehold.co/200x150/1c1c28/ffffff?text=${encoded}`,
          amazonUrl: `https://www.amazon.in/s?k=${encoded}`,
          flipkartUrl: `https://www.flipkart.com/search?q=${encoded}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  const activeProducts = searchResults.length > 0 ? searchResults : farmProducts;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        
        <h2>{searchResults.length > 0 ? `Results for "${searchTerm}"` : "Farm Kart - Essentials"}</h2>

        <form onSubmit={handleSearchSubmit} className="form-group" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Search for any farm product (e.g. Vermicompost, seeds, tools...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="form-submit-btn" style={{ width: '100px', margin: 0, padding: '10px' }}>Search</button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <button 
              onClick={handleClearSearch}
              style={{
                background: 'none',
                border: '1px solid var(--primary-neon)',
                color: 'var(--primary-neon)',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 221, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ← Back to Essentials
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#00dd00', padding: '40px' }}>✨ AI is compiling options from Amazon and Flipkart...</p>
        ) : (
          <div id="farmKartGrid">
            {activeProducts.map((p, idx) => (
              <div key={idx} className="product-card">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x150/cccccc/000000?text=Image+Not+Found';
                  }}
                />
                <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h4>{p.name}</h4>
                    <p style={{ margin: '10px 0' }}>{p.price}</p>
                  </div>
                  
                  {p.amazonUrl || p.flipkartUrl ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      {p.amazonUrl && (
                        <a 
                          href={p.amazonUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="buy-now-btn"
                          style={{
                            backgroundColor: '#FF9900',
                            color: '#000000',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            padding: '10px 5px',
                            textAlign: 'center',
                            flex: 1,
                            textDecoration: 'none',
                            borderRadius: '5px'
                          }}
                        >
                          Amazon
                        </a>
                      )}
                      {p.flipkartUrl && (
                        <a 
                          href={p.flipkartUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="buy-now-btn"
                          style={{
                            backgroundColor: '#2874F0',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            padding: '10px 5px',
                            textAlign: 'center',
                            flex: 1,
                            textDecoration: 'none',
                            borderRadius: '5px'
                          }}
                        >
                          Flipkart
                        </a>
                      )}
                    </div>
                  ) : (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="buy-now-btn">Buy Now</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
