import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE = API_BASE.replace('/api', '');

function DealsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';
  const locationParam = searchParams.get('location') || '';
  const brandParam = searchParams.get('brand') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [tempFilters, setTempFilters] = useState({
    type: typeParam,
    location: locationParam,
    brand: brandParam,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    type: typeParam,
    location: locationParam,
    brand: brandParam,
  });

  // Fetch location suggestions
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/areas`);
        let suggestions = [];
        if (Array.isArray(res.data)) {
          res.data.forEach(area => {
            if (area.microMarkets && Array.isArray(area.microMarkets)) suggestions.push(...area.microMarkets);
            if (area.name) suggestions.push(area.name);
          });
        }
        setLocationSuggestions([...new Set(suggestions)].filter(Boolean).sort());
      } catch (err) {
        console.warn('Could not fetch areas', err);
      }
    };
    fetchLocations();
  }, []);

  const fetchProperties = useCallback(async (page = 1, filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.location) params.append('location', filters.location);
      if (filters.brand) params.append('brand', filters.brand);
      params.append('page', page);
      params.append('limit', 12);

      const response = await axios.get(`${API_BASE}/properties`, { params });

      let propertiesData = [];
      let total = 1;

      if (response.data) {
        if (Array.isArray(response.data)) {
          propertiesData = response.data;
          total = 1;
        } else if (response.data.properties && Array.isArray(response.data.properties)) {
          propertiesData = response.data.properties;
          total = response.data.totalPages || 1;
        }
      }

      setProperties(propertiesData);
      setTotalPages(total);
    } catch (err) {
      console.error(err);
      setError('Failed to load properties. Please try again.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when filters or page change
  useEffect(() => {
    fetchProperties(pageParam, appliedFilters);
  }, [pageParam, appliedFilters, fetchProperties]);

  const performSearch = () => {
    const newFilters = { ...tempFilters };
    setAppliedFilters(newFilters);
    const newParams = {};
    if (newFilters.type && newFilters.type !== 'all') newParams.type = newFilters.type;
    if (newFilters.location) newParams.location = newFilters.location;
    if (newFilters.brand) newParams.brand = newFilters.brand;
    newParams.page = '1';
    setSearchParams(newParams);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') performSearch();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    const emptyFilters = { type: 'all', location: '', brand: '' };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchParams({ page: '1' });
    fetchProperties(1, emptyFilters);
  };

  const removeBrandFilter = () => {
    const newFilters = { ...appliedFilters, brand: '' };
    setAppliedFilters(newFilters);
    setTempFilters(newFilters);
    const newParams = {};
    if (newFilters.type && newFilters.type !== 'all') newParams.type = newFilters.type;
    if (newFilters.location) newParams.location = newFilters.location;
    newParams.page = '1';
    setSearchParams(newParams);
    fetchProperties(1, newFilters);
  };

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams(prev => {
      const updated = { ...Object.fromEntries(prev) };
      updated.page = newPage.toString();
      if (appliedFilters.type && appliedFilters.type !== 'all') updated.type = appliedFilters.type;
      if (appliedFilters.location) updated.location = appliedFilters.location;
      if (appliedFilters.brand) updated.brand = appliedFilters.brand;
      return updated;
    });
  };

  const goHome = () => {
    navigate('/');
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x250?text=No+Image';
    if (path.startsWith('http')) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${STATIC_BASE}${normalized}`;
  };

  if (loading && properties.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '5rem 0' }}>
      {/* Back to Home button */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={goHome}
          className="btn-outline-gold"
          style={{ fontSize: '0.9rem', padding: '0.3rem 1rem', cursor: 'pointer' }}
        >
          ← Back to Home
        </button>
      </div>

      <h2 className="section-title">All Properties</h2>

      {/* Active brand filter chip */}
      {appliedFilters.brand && (
        <div className="active-filter-chip" style={{ marginBottom: '1rem', background: '#f1f1f1', padding: '0.5rem 1rem', borderRadius: '30px', display: 'inline-block' }}>
          🔍 Showing properties for brand: <strong>{appliedFilters.brand}</strong>
          <button onClick={removeBrandFilter} style={{ marginLeft: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✖</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <select name="type" value={tempFilters.type} onChange={handleInputChange}>
          <option value="all">All Types</option>
          <option value="resale">Resale</option>
          <option value="rent">Rent</option>
          <option value="floor">Builder Floor</option>
          <option value="plot">Plot</option>
        </select>

        <input
          type="text"
          name="location"
          list="location-suggestions"
          placeholder="Location (e.g., New Gurgaon, Golf Course Road)"
          value={tempFilters.location}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          style={{ minWidth: '250px' }}
        />
        <datalist id="location-suggestions">
          {locationSuggestions.map((loc, idx) => (
            <option key={idx} value={loc} />
          ))}
        </datalist>

              <button type="button" className="btn-outline-gold" onClick={performSearch}>
          Apply
        </button>
        <button type="button" className="btn-outline-gold" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {properties.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>No properties match your criteria.</p>
      ) : (
        <>
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} getImageUrl={getImageUrl} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => goToPage(pageParam - 1)}
                disabled={pageParam === 1}
                className="page-btn"
                style={{ padding: '0.4rem 0.8rem', borderRadius: '30px', border: '1px solid #ddd', background: '#fff', cursor: pageParam === 1 ? 'not-allowed' : 'pointer', opacity: pageParam === 1 ? 0.5 : 1 }}
              >
                Prev
              </button>
              {[...Array(totalPages).keys()].map(num => {
                const pageNum = num + 1;
                if (totalPages <= 7 || (pageNum >= pageParam - 2 && pageNum <= pageParam + 2) || pageNum === 1 || pageNum === totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`page-btn ${pageParam === pageNum ? 'active' : ''}`}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '30px',
                        border: '1px solid #ddd',
                        background: pageParam === pageNum ? '#C6A43F' : '#fff',
                        color: pageParam === pageNum ? '#fff' : '#333',
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === pageParam - 3 || pageNum === pageParam + 3) {
                  return <span key={pageNum} style={{ padding: '0.4rem' }}>...</span>;
                }
                return null;
              })}
              <button
                onClick={() => goToPage(pageParam + 1)}
                disabled={pageParam === totalPages}
                className="page-btn"
                style={{ padding: '0.4rem 0.8rem', borderRadius: '30px', border: '1px solid #ddd', background: '#fff', cursor: pageParam === totalPages ? 'not-allowed' : 'pointer', opacity: pageParam === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PropertyCard({ property, getImageUrl }) {
  const imageUrl = getImageUrl(property.images?.[0]);
  let locationText = property.area;
  if (!locationText && property.projectId) {
    locationText = property.projectId.location?.address || property.projectId.location?.city || 'Gurgaon';
  }
  if (!locationText) locationText = 'Gurgaon';

  const priceDisplay = property.unitDetails?.price || (property.unitDetails?.priceValue ? `₹${property.unitDetails.priceValue.toLocaleString()}` : 'Contact for price');
  const typeLabel = property.unitDetails?.type === 'resale' ? 'Apartment' :
    property.unitDetails?.type === 'floor' ? 'Builder Floor' :
      property.unitDetails?.type === 'plot' ? 'Plot' : 'Rent';

  return (
    <Link to={`/property/${property.slug}`} className="property-card">
      <div className="property-image">
        <img src={imageUrl} alt={property.title} loading="lazy" />
      </div>
      <div className="property-info">
        <h3>{property.title}</h3>
        <p className="location">📍 {locationText}</p>
        <p className="price">{priceDisplay}</p>
        <span className="type-badge">{typeLabel}</span>
      </div>
    </Link>
  );
}

export default DealsPage;