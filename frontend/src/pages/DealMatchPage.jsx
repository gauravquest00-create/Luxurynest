import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../style/DealMatchPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE = API_BASE.replace('/api', '');

function DealMatchPage() {
  const [formData, setFormData] = useState({
    purpose: 'buy',
    propertyType: '',
    bedrooms: '',
    plotSize: '',
    budgetRange: '',
    customBudget: '',
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const propertyTypeOptions = {
    buy: [
      { value: 'apartment', label: 'Apartment' },
      { value: 'builderfloor', label: 'Builder Floor' },
      { value: 'plot', label: 'Plot' },
    ],
    rent: [
      { value: 'apartment', label: 'Apartment' },
      { value: 'builderfloor', label: 'Builder Floor' },
    ],
  };

  const budgetRanges = {
    buy: [
      { label: '₹1 Cr – ₹2 Cr', min: 10000000, max: 20000000 },
      { label: '₹2 Cr – ₹3 Cr', min: 20000000, max: 30000000 },
      { label: '₹3 Cr – ₹5 Cr', min: 30000000, max: 50000000 },
      { label: '₹5 Cr – ₹7 Cr', min: 50000000, max: 70000000 },
      { label: '₹7 Cr – ₹10 Cr', min: 70000000, max: 100000000 },
      { label: '₹10 Cr+', min: 100000000, max: Infinity },
    ],
    rent: [
      { label: 'Up to ₹20k', min: 0, max: 20000 },
      { label: '₹20k – ₹30k', min: 20000, max: 30000 },
      { label: '₹30k – ₹40k', min: 30000, max: 40000 },
      { label: '₹40k – ₹50k', min: 40000, max: 50000 },
      { label: '₹50k – ₹75k', min: 50000, max: 75000 },
      { label: '₹75k+', min: 75000, max: Infinity },
    ],
  };

  const bedroomOptions = ['1', '2', '2.5', '3', '3.5', '4', '5+'];

  const handlePurposeChange = (value) => {
    setFormData({ 
      purpose: value, 
      propertyType: '', 
      bedrooms: '', 
      plotSize: '',
      budgetRange: '', 
      customBudget: '' 
    });
    setOpenDropdown(null);
  };

  const getPropertyTypeLabel = () => {
    const options = propertyTypeOptions[formData.purpose];
    const selected = options.find(opt => opt.value === formData.propertyType);
    return selected ? selected.label : 'Select Property Type';
  };

  const getBudgetLabel = () => {
    if (formData.customBudget) return `₹${formData.customBudget}`;
    const ranges = budgetRanges[formData.purpose];
    const selected = ranges.find(r => r.label === formData.budgetRange);
    return selected ? selected.label : 'Select Budget';
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      budgetRange: '', 
      customBudget: value 
    }));
  };

  const handleBudgetSelect = (label) => {
    setFormData(prev => ({ 
      ...prev, 
      budgetRange: label, 
      customBudget: '' 
    }));
    setOpenDropdown(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.propertyType) {
      setError('Please select a property type.');
      return;
    }

    let minBudget = 0, maxBudget = Infinity;
    
    if (formData.customBudget) {
      const customNum = parseFloat(formData.customBudget);
      if (!isNaN(customNum) && customNum > 0) {
        minBudget = customNum;
        maxBudget = customNum;
      }
    } else if (formData.budgetRange) {
      const range = budgetRanges[formData.purpose].find(r => r.label === formData.budgetRange);
      if (range) {
        minBudget = range.min;
        maxBudget = range.max;
      }
    } else {
      setError('Please select or enter a budget.');
      return;
    }

    const payload = {
      purpose: formData.purpose,
      propertyType: formData.propertyType,
      minBudget,
      maxBudget,
      bedrooms: formData.propertyType === 'plot' ? null : (formData.bedrooms || null),
      plotSize: formData.propertyType === 'plot' ? (formData.plotSize || null) : null,
    };

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await axios.post(`${API_BASE}/match`, payload);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x250?text=No+Image';
    if (path.startsWith('http')) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${STATIC_BASE}${normalized}`;
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      setOpenDropdown(null);
    }
  };

  useState(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isPlot = formData.propertyType === 'plot';

  return (
    <div className="deal-match-container">
      <div className="deal-match-header">
        <h1>Find Your Perfect Match</h1>
        <p>Tell us your preferences and we'll show you the best properties</p>
      </div>

      <form onSubmit={handleSubmit} className="deal-match-form">
        {/* Purpose Buttons */}
        <div className="purpose-buttons">
          <button type="button" className={`purpose-btn ${formData.purpose === 'buy' ? 'active' : ''}`} onClick={() => handlePurposeChange('buy')}>Buy</button>
          <button type="button" className={`purpose-btn ${formData.purpose === 'rent' ? 'active' : ''}`} onClick={() => handlePurposeChange('rent')}>Rent</button>
        </div>

        {/* Property Type Dropdown */}
        <div className="form-group">
          <label>Property Type *</label>
          <div className="custom-select-wrapper">
            <div className="custom-select-trigger" onClick={() => setOpenDropdown(openDropdown === 'propertyType' ? null : 'propertyType')}>
              <span className="selected-value">{getPropertyTypeLabel()}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            {openDropdown === 'propertyType' && (
              <ul className="custom-options open">
                {propertyTypeOptions[formData.purpose].map(option => (
                  <li key={option.value} onClick={() => {
                    setFormData(prev => ({ ...prev, propertyType: option.value, bedrooms: '', plotSize: '' }));
                    setOpenDropdown(null);
                  }}>
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bedrooms (only for apartment/builderfloor) */}
        {!isPlot && (
          <div className="form-group">
            <label>Configuration (Bedrooms)</label>
            <div className="custom-select-wrapper">
              <div className="custom-select-trigger" onClick={() => setOpenDropdown(openDropdown === 'bedrooms' ? null : 'bedrooms')}>
                <span className="selected-value">{formData.bedrooms ? `${formData.bedrooms} BHK` : 'Select Bedrooms'}</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              {openDropdown === 'bedrooms' && (
                <ul className="custom-options open">
                  <li onClick={() => { setFormData(prev => ({ ...prev, bedrooms: '' })); setOpenDropdown(null); }}>Any</li>
                  {bedroomOptions.map(b => (
                    <li key={b} onClick={() => { setFormData(prev => ({ ...prev, bedrooms: b })); setOpenDropdown(null); }}>{b} BHK</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Plot Size (only for plot) */}
        {isPlot && (
          <div className="form-group">
            <label>Plot Size (sqyd) *</label>
           <input 
    type="number" 
    className="plot-size-input"
    placeholder="Enter plot size in square yards"
    value={formData.plotSize}
    onChange={(e) => setFormData(prev => ({ ...prev, plotSize: e.target.value }))}
    min="60"
/>
          </div>
        )}

        {/* Budget Section */}
        <div className="form-group">
          <label>Budget Range *</label>
          <div className="custom-select-wrapper">
            <div className="custom-select-trigger" onClick={() => setOpenDropdown(openDropdown === 'budget' ? null : 'budget')}>
              <span className="selected-value">{getBudgetLabel()}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            {openDropdown === 'budget' && (
              <ul className="custom-options open">
                {budgetRanges[formData.purpose].map((range, idx) => (
                  <li key={idx} onClick={() => handleBudgetSelect(range.label)}>
                    {range.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Manual Budget Input */}
        <div className="form-group">
          <label>Or Enter Custom Budget (₹)</label>
          <input 
            type="number" 
            className="custom-budget-input"
            placeholder="e.g., 5000000 for ₹50 Lakhs"
            value={formData.customBudget}
            onChange={handleBudgetChange}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-gold">
          {loading ? 'Finding matches...' : 'Find My Match'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {results && (
        <div className="match-results">
          {results.meta?.message && <div className="info-message">{results.meta.message}</div>}
          {results.bestMatches?.length > 0 && (
            <>
              <h2>🏆 Best Matches</h2>
              <div className="property-grid">
                {results.bestMatches.map(property => (
                  <PropertyCard key={property._id} property={property} getImageUrl={getImageUrl} />
                ))}
              </div>
            </>
          )}
          {results.bufferMatches?.length > 0 && (
            <>
              <h2 style={{ marginTop: '2rem' }}>💡 You Might Also Like</h2>
              <div className="property-grid">
                {results.bufferMatches.map(property => (
                  <PropertyCard key={property._id} property={property} getImageUrl={getImageUrl} />
                ))}
              </div>
            </>
          )}
          {results.bestMatches?.length === 0 && results.bufferMatches?.length === 0 && (
            <p className="no-results">No properties match your criteria. Try broadening your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property, getImageUrl }) {
  const imageUrl = getImageUrl(property.images?.[0]);
  let locationText = property.area;
  if (!locationText && property.projectId) {
    locationText = property.projectId.location?.address || property.projectId.location?.city;
  }
  if (!locationText) locationText = 'Gurgaon';

  let priceDisplay = property.unitDetails?.price;
  if (!priceDisplay && property.unitDetails?.priceValue) {
    const val = property.unitDetails.priceValue;
    if (val >= 1e7) priceDisplay = `₹${(val / 1e7).toFixed(2)} Cr`;
    else if (val >= 1e5) priceDisplay = `₹${(val / 1e5).toFixed(2)} L`;
    else priceDisplay = `₹${val.toLocaleString()}`;
  }
  if (!priceDisplay) priceDisplay = 'Contact for price';

  const typeLabel = {
    resale: 'Apartment',
    rent: 'Rent',
    floor: 'Builder Floor',
    plot: 'Plot',
  }[property.unitDetails?.type] || 'Property';

  return (
    <Link to={`/property/${property.slug}`} className="property-card">
      <div className="property-image"><img src={imageUrl} alt={property.title} loading="lazy" /></div>
      <div className="property-info">
        <h3>{property.title}</h3>
        <p className="location">📍 {locationText}</p>
        <p className="price">{priceDisplay}</p>
        <span className="type-badge">{typeLabel}</span>
      </div>
    </Link>
  );
}

export default DealMatchPage;