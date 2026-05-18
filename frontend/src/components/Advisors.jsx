import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://luxurynest.onrender.com/api';

function Advisors() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/advisors`);
        setAdvisors(res.data);
      } catch (err) {
        console.error('Failed to fetch advisors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  if (loading) return <div className="advisors-loading">Loading advisors...</div>;
  if (advisors.length === 0) return null;

  return (
    <section className="advisors-section">
      <div className="container">
        <div className="advisors-header">
          <span className="advisors-tag">OUR EXPERTS</span>
          <h2 className="advisors-title">Your direct line to expertise</h2>
          <p className="advisors-subtitle">No chatbots. No automated calls. Real people.</p>
        </div>

        <div className="advisors-grid">
          {advisors.map((advisor) => (
            <div key={advisor._id} className="advisor-card-horizontal">
              <div className="advisor-image">
                <img src={advisor.image || 'https://via.placeholder.com/120'} alt={advisor.name} />
              </div>
              <div className="advisor-info">
                <h3>{advisor.name}</h3>
                <p className="advisor-role">{advisor.role || 'Real Estate Advisor'}</p>
                <div className="advisor-links">
                  <a href={`https://wa.me/91${advisor.phone}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                  <a href={`mailto:${advisor.email}`}>Email</a>
                </div>
                <Link to={`/advisor?id=${advisor._id}`} className="advisor-contact-btn">
                  Contact Advisor
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Advisors;
