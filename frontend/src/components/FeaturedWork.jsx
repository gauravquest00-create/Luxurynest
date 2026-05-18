import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE = API_BASE.replace('/api', '');

function FeaturedWork() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x250?text=No+Image';
    if (path.startsWith('http')) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${STATIC_BASE}${normalized}`;
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_BASE}/properties?featured=true&_limit=3`);
        setProperties(res.data);
      } catch (err) {
        console.error('Failed to fetch featured properties', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return <div className="featured-loading">Loading featured properties...</div>;
  if (properties.length === 0) return null;

  return (
    <section className="featured-work">
      <div className="container">
        <div className="featured-header">
          <span className="featured-tag">OUR SELECTION</span>
          <h2 className="featured-title">Featured Work</h2>
          <p className="featured-subtitle">
            Handpicked properties that reflect quality, comfort, and value.
          </p>
        </div>

        <div className="featured-grid">
          {properties.map((property) => (
            <div key={property._id} className="featured-card">
              <Link 
                to={`/property/${property.slug}`} 
                className="featured-card-link"
                aria-label={`View details for ${property.title}`}
              >
                <div className="featured-card-image">
                  <img
                    src={getImageUrl(property.images?.[0])}
                    alt={property.title}
                    width="400"
                    height="250"
                    loading="lazy"
                  />
                </div>
                <div className="featured-card-content">
                  <h3>{property.title}</h3>
                  <p className="featured-location">
                    {property.projectId?.location?.address || property.location || 'Gurgaon'}
                  </p>
                  <p className="featured-price">{property.unitDetails?.price}</p>
                  <span className="featured-view-link">View Details →</span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="featured-more">
          <Link to="/deals" className="btn-outline-gold">View More Properties</Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedWork;