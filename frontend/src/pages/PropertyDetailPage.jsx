import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReusableLeadForm from '../components/ReusableLeadForm';
import API from "../config/api";
// ✅ FIX: remove extra /api
const API_BASE = 'https://luxurynest.onrender.com';

function PropertyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [project, setProject] = useState(null);
  const [areaData, setAreaData] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formAction, setFormAction] = useState('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeAreaTab, setActiveAreaTab] = useState('connectivity');

  const getImageUrl = (path) => {
    if (!path) return '/placeholder-image.jpg';
    if (path.startsWith('http')) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${STATIC_BASE}${normalized}`;
  };

  const fetchAreaByName = async (areaName) => {
    if (!areaName) return null;
    try {
      const res = await axios.get(`${API_BASE}/areas`, { params: { name: areaName } });
      return res.data?.[0] || null;
    } catch {
      return null;
    }
  };

  const fetchRecommendedProperties = async (areaName, currentId) => {
    if (!areaName) return;
    try {
      const res = await axios.get(`${API_BASE}/properties?limit=20&liveStatus=active`);
      const allProps = res.data;
      if (!Array.isArray(allProps)) return;
      let filtered = allProps.filter(p => p.area === areaName && p._id !== currentId && p.liveStatus === 'active');
      if (filtered.length === 0) {
        filtered = allProps.filter(p => p.location?.city === areaName || p.propertyType === property?.propertyType).slice(0, 4);
      }
      setRecommendedProperties(filtered.slice(0, 4));
    } catch (err) {
      console.warn('Failed to fetch recommended properties', err);
    }
  };

  // Helper to fetch advisors by IDs (returns array of unique advisors)
  const fetchAdvisorsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const uniqueIds = [...new Set(ids)];
    const promises = uniqueIds.map(id => axios.get(`${API_BASE}/advisors/${id}`).catch(() => null));
    const results = await Promise.all(promises);
    return results.filter(r => r && r.data).map(r => r.data);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API_BASE}/properties/${slug}`);
        const prop = res.data.property;
        const proj = res.data.project || null;
        if (!prop) throw new Error('Property not found');
        setProperty(prop);
        setProject(proj);
        if (prop.images?.length) setSelectedImageIndex(0);

        const isApartment = !!proj;
        const areaName = isApartment ? proj?.area : prop.area;
        if (areaName) {
          const areaInfo = await fetchAreaByName(areaName);
          setAreaData(areaInfo);
          await fetchRecommendedProperties(areaName, prop._id);
        }

        // ---- Fetch advisors ----
        let advisorIds = [];
        if (prop.advisorIds && prop.advisorIds.length > 0) {
          advisorIds = prop.advisorIds;
        } else if (prop.advisorId) {
          advisorIds = [prop.advisorId];
        }

        let fetchedAdvisors = [];
        if (advisorIds.length > 0) {
          fetchedAdvisors = await fetchAdvisorsByIds(advisorIds);
        }

        // If we have fewer than 2 advisors, add extra advisors from the general list (excluding duplicates)
        if (fetchedAdvisors.length < 2) {
          try {
            const extraRes = await axios.get(`${API_BASE}/advisors?limit=5`);
            if (extraRes.data && extraRes.data.length) {
              const existingIds = fetchedAdvisors.map(a => a._id);
              const extra = extraRes.data.filter(a => !existingIds.includes(a._id)).slice(0, 2 - fetchedAdvisors.length);
              fetchedAdvisors = [...fetchedAdvisors, ...extra];
            }
          } catch (err) {
            console.warn('Could not fetch extra advisors', err);
          }
        }

        setAdvisors(fetchedAdvisors);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 404) setError('Property not found');
        else setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (error) return <div className="error-screen">{error}</div>;
  if (!property) return <div className="error-screen">No property data</div>;

  const { unitDetails, images, title, area, propertyType, description, societyName, buildingStructure } = property;
  const fullImages = (images || []).map(getImageUrl);
  const isApartment = !!project;
  const areaName = isApartment ? project?.area : area;
  const locationText = project?.location?.address || project?.location?.city || area || 'Gurgaon';
  const developer = project?.developer || {};

  const connectivityList = isApartment ? (project?.connectivity || []) : (areaData?.connectivity || []);
  const uspList = isApartment ? (project?.features?.usp || []) : (areaData?.areaUsp || []);
  const amenitiesList = isApartment ? (project?.amenities || {}) : {};
  const marketAnalysis = areaData?.marketAnalysis || [];
  const priceInsight = areaData?.priceInsight || null;
  const areaKnowledge = areaData?.areaKnowledge || null;

  const getPriceValue = () => {
    if (unitDetails?.priceValue) return unitDetails.priceValue;
    if (unitDetails?.price) return parseFloat(unitDetails.price) || null;
    return null;
  };
  const formatPrice = (priceValue) => {
    if (!priceValue) return 'Contact for price';
    if (priceValue >= 1e7) return `₹${(priceValue / 1e7).toFixed(2)} Cr`;
    if (priceValue >= 1e5) return `₹${(priceValue / 1e5).toFixed(2)} L`;
    return `₹${priceValue.toLocaleString()}`;
  };
  const priceValueNum = getPriceValue();
  const priceDisplay = formatPrice(priceValueNum);
  const pricePerSqft = unitDetails?.priceValue && unitDetails?.sqft
    ? (unitDetails.priceValue / unitDetails.sqft).toFixed(0) : null;

  const bedrooms = unitDetails?.bedrooms ?? (propertyType === 'builderfloor' ? '—' : '—');
  let bathrooms = unitDetails?.bathrooms;
  if (propertyType === 'builderfloor' && (bathrooms === undefined || bathrooms === null)) {
    bathrooms = unitDetails?.bedrooms ?? '—';
  }
  if (bathrooms === undefined || bathrooms === null) bathrooms = '—';

  let sizeText = '—';
  if (unitDetails?.sqft) sizeText = `${unitDetails.sqft} sqft`;
  else if (unitDetails?.size) sizeText = `${unitDetails.size} ${unitDetails.sizeUnit || 'sqyd'}`;
  else if (unitDetails?.plotArea) sizeText = `${unitDetails.plotArea} sqyd`;
  else if (propertyType === 'builderfloor') sizeText = 'Not specified';

  const availabilityStatus = property.availability?.status || unitDetails?.availability || 'ready_to_move';
  const isNegotiable = property.gatedInfo?.negotiationInsights === 'Flexible' || false;
  const lastUpdated = property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : 'recently';

  const mainAdvisor = advisors[0] || {};
  const advisorPhone = mainAdvisor.phone || '919650796186';
  const advisorName = mainAdvisor.name || 'Sandeep Goyal';
  const whatsappMessage = `Hello, I am interested in this property:%0A%0A🏷️ *${title}*%0A📍 *Location:* ${locationText}%0A💰 *Price:* ${priceDisplay}%0A🛏️ *Bedrooms:* ${bedrooms}%0A🛁 *Bathrooms:* ${bathrooms}%0A📐 *Area:* ${sizeText}%0A%0APlease share more details.`;
  const whatsappUrl = `https://wa.me/${advisorPhone}?text=${whatsappMessage}`;

  const openFormModal = (action) => { setFormAction(action); setFormOpen(true); };
  const openLightbox = (index) => { setLightboxIndex(index); setShowLightbox(true); };
  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % fullImages.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + fullImages.length) % fullImages.length);

  const renderAreaTabContent = () => {
    if (!areaData) return <p>No area insights available for {areaName}.</p>;
    switch (activeAreaTab) {
      case 'connectivity':
        return areaData.connectivity?.length ? (
          <div className="area-connectivity-list">
            {areaData.connectivity.map((item, idx) => {
              const parts = item.split(' – ');
              return (
                <div key={idx} className="connectivity-item">
                  <span>{parts[0]}</span>
                  <span className="distance">{parts[1]}</span>
                </div>
              );
            })}
          </div>
        ) : <p>No connectivity data.</p>;
      case 'lifestyle':
        return areaData.areaKnowledge ? (
          <div>
            <p><strong>Vibe:</strong> {areaData.areaKnowledge.vibe}</p>
            <p><strong>Social Infrastructure:</strong> {areaData.areaKnowledge.socialInfra}</p>
            <p><strong>Convenience:</strong> {areaData.areaKnowledge.convenience}</p>
          </div>
        ) : <p>No lifestyle info.</p>;
      case 'usp':
        return areaData.areaUsp?.length ? <ul>{areaData.areaUsp.map((u, i) => <li key={i}>{u}</li>)}</ul> : <p>No USP data.</p>;
      case 'market':
        return areaData.marketAnalysis?.length ? <ul>{areaData.marketAnalysis.map((m, i) => <li key={i}>{m}</li>)}</ul> : <p>No market trends.</p>;
      case 'price':
        return areaData.priceInsight ? (
          <div>
            <p><strong>Average Rate:</strong> {areaData.priceInsight.averageRate}</p>
            <p><strong>Rental Range:</strong> {areaData.priceInsight.rentalRange}</p>
            <p><strong>Appreciation Potential:</strong> {areaData.priceInsight.appreciationPotential}</p>
          </div>
        ) : <p>No price insights.</p>;
      default: return null;
    }
  };

  return (
    <div className="property-detail-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      {/* Hero Carousel */}
      <div className="hero-carousel">
        <div className="hero-image-wrapper">
          <img src={fullImages[selectedImageIndex] || '/placeholder-image.jpg'} alt={title} className="hero-image" />
          {fullImages.length > 1 && (
            <>
              <button onClick={prevImage} className="carousel-arrow left">‹</button>
              <button onClick={nextImage} className="carousel-arrow right">›</button>
              <div className="thumbnail-strip">
                {fullImages.map((img, idx) => (
                  <img key={idx} src={img} alt="thumb" className={`thumbnail ${selectedImageIndex === idx ? 'active' : ''}`} onClick={() => setSelectedImageIndex(idx)} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="glass-overlay">
          <h1 className="glass-title">{title}</h1>
          <div className="glass-location">📍 {locationText}</div>
          <div className="glass-price">{priceDisplay} {pricePerSqft && <span className="price-per-sqft">| ₹{pricePerSqft}/sqft</span>}</div>
          <div className="glass-buttons">
            <button onClick={() => window.location.href = `tel:${advisorPhone}`} className="btn-call">Call Now</button>
            <button onClick={() => window.open(whatsappUrl)} className="btn-wa">WhatsApp</button>
            <button onClick={() => openFormModal('details')} className="btn-outline">Get Details</button>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {fullImages.length > 0 && (
        <div className="gallery-section">
          <h2>Photo Gallery</h2>
          <div className="gallery-grid">
            {fullImages.map((img, idx) => (
              <div key={idx} className="gallery-item" onClick={() => openLightbox(idx)}>
                <img src={img} alt={`gallery-${idx}`} />
                <div className="gallery-overlay">View</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="two-columns">
        <div className="left-column">
          {/* About Property – Specs only */}
          <div className="card">
            <div className="card-header"><h2>About This Property</h2></div>
            <div className="specs-grid">
              <div className="spec-item"><span className="spec-icon">🛏️</span><div className="spec-info"><span className="spec-label">Bedrooms</span><span className="spec-value">{bedrooms}</span></div></div>
              <div className="spec-item"><span className="spec-icon">🛁</span><div className="spec-info"><span className="spec-label">Bathrooms</span><span className="spec-value">{bathrooms}</span></div></div>
              <div className="spec-item"><span className="spec-icon">📐</span><div className="spec-info"><span className="spec-label">Area</span><span className="spec-value">{sizeText}</span></div></div>
              <div className="spec-item"><span className="spec-icon">🏷️</span><div className="spec-info"><span className="spec-label">Type</span><span className="spec-value">{unitDetails?.type || propertyType || 'Resale'}</span></div></div>
            </div>
          </div>

          {/* Why This Property */}
          <div className="card">
            <h2>Why This Property?</h2>
            <ul className="why-list">
              {uspList.length ? uspList.map((u, i) => <li key={i}>✨ {u}</li>) : (
                <>
                  <li>✨ Premium location & amenities</li>
                  <li>🌿 Private terraces and garden views</li>
                  <li>🏊 High-end amenities: fitness center, swimming pool</li>
                  <li>🚗 Prime location with easy access to highways</li>
                </>
              )}
            </ul>
          </div>

          {/* Project Details (only for apartments) */}
          {isApartment && project && (
            <div className="card project-card">
              <h2>About the Project</h2>
              <h3>{project.name}</h3>
              <p className="developer">by {developer.name || project.developer}</p>
              {Object.keys(amenitiesList).length > 0 && (
                <>
                  <h4>Amenities</h4>
                  <div className="amenities-tags">{Object.values(amenitiesList).flat().slice(0, 8).map((a, i) => <span key={i} className="tag">{a}</span>)}</div>
                </>
              )}
              {project.connectivity && project.connectivity.length > 0 && (
                <>
                  <h4>Connectivity</h4>
                  <ul className="connectivity-list">{project.connectivity.slice(0, 4).map((item, i) => <li key={i}><span>{item.name}</span> <span>{item.distance}</span></li>)}</ul>
                </>
              )}
              <div className="map-placeholder">🗺️ Location map preview</div>
            </div>
          )}

          {/* Builder Floor Details */}
          {!isApartment && (propertyType === 'builderfloor' || propertyType === 'plot') && (
            <div className="card">
              <h2>Builder Floor Details</h2>
              <div className="details-grid">
                <div><strong>Building Name</strong><br/>{societyName || project?.name || '—'}</div>
                <div><strong>Total Floors</strong><br/>{unitDetails?.totalFloors || '—'}</div>
                <div><strong>Unit Floor</strong><br/>{unitDetails?.floorNumber || '—'}</div>
                <div><strong>Property Age</strong><br/>{unitDetails?.age || 'Ready to Move'}</div>
                <div><strong>Structure</strong><br/>{buildingStructure || 'RCC with Earthquake Resistant Design'}</div>
              </div>
            </div>
          )}

          {/* Area Insights */}
          {areaData && (
            <div className="card">
              <h2>Area Insights</h2>
              <div className="tabs">
                {['connectivity', 'lifestyle', 'usp', 'market', 'price'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeAreaTab === tab ? 'active' : ''}`} onClick={() => setActiveAreaTab(tab)}>
                    {tab === 'connectivity' ? 'Connectivity' : tab === 'lifestyle' ? 'Lifestyle' : tab === 'usp' ? 'USP Highlights' : tab === 'market' ? 'Market Trends' : 'Price Insights'}
                  </button>
                ))}
              </div>
              <div className="tab-content">{renderAreaTabContent()}</div>
            </div>
          )}
        </div>

        {/* Right Sidebar – Multiple Advisors (no duplicates) */}
        <aside className="right-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-price">{priceDisplay}</div>
            {pricePerSqft && <div className="sidebar-price-sqft">₹{pricePerSqft}/sqft</div>}
            <div className="badge-group">
              <span className="badge-ready">{availabilityStatus === 'ready_to_move' ? 'Ready to Move' : 'Under Construction'}</span>
              {isNegotiable && <span className="badge-negotiable">Negotiable</span>}
            </div>
            <button onClick={() => openFormModal('details')} className="sidebar-btn primary">Request Details</button>
            <button onClick={() => openFormModal('callback')} className="sidebar-btn outline">Get Callback</button>
            <button onClick={() => openFormModal('brochure')} className="sidebar-btn outline">Download Brochure</button>
            <hr />
            <div className="advisors-list">
              {advisors.map((adv, idx) => (
                <div key={adv._id || idx} className="advisor-card">
                  <img src="https://via.placeholder.com/50" alt={adv.name} />
                  <div>
                    <div className="advisor-name">{adv.name || 'Advisor'}</div>
                    <div className="advisor-role">Senior Advisor</div>
                    <a href={`https://wa.me/${adv.phone || '919650796186'}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="advisor-wa-link">WhatsApp Advisor</a>
                  </div>
                </div>
              ))}
              {/* Fallback if no advisors loaded */}
              {advisors.length === 0 && (
                <div className="advisor-card">
                  <img src="https://via.placeholder.com/50" alt="Advisor" />
                  <div>
                    <div className="advisor-name">Sandeep Goyal</div>
                    <div className="advisor-role">Senior Advisor</div>
                    <a href={whatsappUrl} className="advisor-wa-link">WhatsApp Advisor</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Recommended Properties */}
      {recommendedProperties.length > 0 && (
        <div className="recommended-section">
          <h2 className="recommended-title">Similar Properties You May Like</h2>
          <div className="recommended-grid">
            {recommendedProperties.map((recProp) => (
              <div key={recProp._id} className="recommended-card" onClick={() => window.location.href = `/property/${recProp.slug}`}>
                <div className="rec-image-wrapper"><img src={getImageUrl(recProp.images?.[0])} alt={recProp.title} className="rec-image" /></div>
                <div className="rec-content">
                  <h3 className="rec-title">{recProp.title}</h3>
                  <div className="rec-location">📍 {recProp.area || recProp.location?.city || 'Gurgaon'}</div>
                  <div className="rec-price">{formatPrice(recProp.unitDetails?.priceValue)}</div>
                  <div className="rec-specs"><span>{recProp.unitDetails?.bedrooms || '—'} BHK</span><span>{recProp.unitDetails?.sqft || recProp.unitDetails?.size || '—'} sqft</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating WhatsApp */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="floating-wa">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </a>

      {/* Lightbox */}
      {showLightbox && (
        <div className="lightbox" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={fullImages[lightboxIndex]} alt="Full size" />
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}>×</button>
            <button className="lightbox-arrow prev" onClick={() => setLightboxIndex((lightboxIndex - 1 + fullImages.length) % fullImages.length)}>‹</button>
            <button className="lightbox-arrow next" onClick={() => setLightboxIndex((lightboxIndex + 1) % fullImages.length)}>›</button>
          </div>
        </div>
      )}

      {/* Lead Form */}
      <ReusableLeadForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        actionType={formAction}
        propertySlug={slug}
        propertyTitle={title}
        propertyPrice={priceDisplay}
        propertyLocation={locationText}
        advisorId={advisors.length > 0 ? advisors[0]._id : null}
      />
    </div>
  );
}

export default PropertyDetailPage;
