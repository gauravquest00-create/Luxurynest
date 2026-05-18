// src/components/Brands.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://luxurynest.onrender.com/api';

// Extended static list of real estate brands (fallback)
const FALLBACK_BRANDS = [
  'M3M', 'Smartworld', 'Signature Global', 'Emaar India', 'Vatika', 'SS Group',
  'Antriksh', 'Spaze', 'Microtech', 'Bestech', 'Elan', 'DLF',
  'Godrej Properties', 'Sobha Limited', 'Prestige Estates', 'Tata Housing',
  'Brigade Group', 'Puranik', 'Mahindra Lifespaces', 'Lodha Group'
];

function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API_BASE}/projects/names`);
        let data = [];
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          data = [...new Set(res.data)];
          console.log('Brands from API:', data.length);
          // If API returns less than 3 brands, use fallback to show variety
          if (data.length < 3) {
            console.warn('API returned few brands, using fallback list');
            data = [...new Set([...data, ...FALLBACK_BRANDS])];
          }
        } else {
          console.warn('API returned no brands, using fallback list');
          data = [...FALLBACK_BRANDS];
        }
        setBrands(data);
      } catch (err) {
        console.error('Error fetching brands, using fallback:', err);
        setBrands([...FALLBACK_BRANDS]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleBrandClick = (brandName) => {
    navigate(`/deals?brand=${encodeURIComponent(brandName)}`);
  };

  // Duplicate enough to ensure seamless scroll (minimum 2 copies, more for smoother transition)
  const duplicatedBrands = brands.length > 0 ? [...brands, ...brands, ...brands] : [];

  const getAvatarUrl = (name) => {
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=C6A43F&color=fff&size=70&bold=true&length=2&rounded=true`;
  };

  if (loading) return <div className="brands-loading" style={{ textAlign: 'center', padding: '3rem' }}>Loading partners...</div>;
  if (brands.length === 0) return null;

  return (
    <section className="brands-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Our Partners</span>
          <h2 className="section-title">Trusted by Leading Builders</h2>
        </div>
      </div>
      <div className="brands-marquee-wrapper">
        <div className="brands-marquee">
          <div className="brands-track">
            {duplicatedBrands.map((brand, idx) => (
              <div
                key={`${brand}-${idx}`}
                className="brand-item"
                onClick={() => handleBrandClick(brand)}
                style={{ cursor: 'pointer' }}
              >
                <div className="brand-card">
                  <img src={getAvatarUrl(brand)} alt={brand} className="brand-avatar" loading="lazy" />
                  <div className="brand-name">{brand}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brands;
