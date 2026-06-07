import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Farm Kart - Essentials</h2>
        <div id="farmKartGrid">
          {farmProducts.map((p, idx) => (
            <div key={idx} className="product-card">
              <img 
                src={p.image} 
                alt={p.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/200x150/cccccc/000000?text=Image+Not+Found';
                }}
              />
              <div className="product-info">
                <h4>{p.name}</h4>
                <p>{p.price}</p>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="buy-now-btn">Buy Now</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
