import { useState, useEffect } from 'react';
import axios from 'axios';
import ReusableLeadForm from '../components/ReusableLeadForm';
import '../style/AdvisorPage.css';
const API_BASE = 'https://luxurynest.onrender.com/api/'

function AdvisorPage() {
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  const [purpose, setPurpose] = useState(''); // 'buying' or 'renting'
  const [propertyType, setPropertyType] = useState(''); // 'apartmentBuilder' or 'plot' (only for buying)
  const [formOpen, setFormOpen] = useState(false);
  
  // Dropdown states
  const [openPurpose, setOpenPurpose] = useState(false);
  const [openPropertyType, setOpenPropertyType] = useState(false);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/advisors`);
        setAdvisors(res.data);
        if (res.data.length > 0) setSelectedAdvisorId(res.data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdvisors();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-select-wrapper')) {
        setOpenPurpose(false);
        setOpenPropertyType(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getAvatarUrl = (name) => {
    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${initials}&background=C6A43F&color=fff&size=100&rounded=true&bold=true`;
  };

  const handleOpenForm = () => {
    if (!purpose) {
      alert('Please select Buying or Renting');
      return;
    }
    if (purpose === 'buying' && !propertyType) {
      alert('Please select property type (Apartment/Builder or Plot)');
      return;
    }
    setFormOpen(true);
  };

  const getPurposeLabel = () => {
    if (purpose === 'buying') return 'Buying';
    if (purpose === 'renting') return 'Renting';
    return 'Select Purpose';
  };

  const getPropertyTypeLabel = () => {
    if (propertyType === 'apartmentBuilder') return 'Apartment / Builder Floor';
    if (propertyType === 'plot') return 'Plot';
    return 'Select Property Type';
  };

  return (
    <div className="container advisor-page">
      <div className="advisor-hero">
        <h1>Speak with our Advisors</h1>
        <p>Share your requirement and we'll connect you with the right advisor.</p>
      </div>

      {/* Advisor Cards */}
      <div className="advisor-cards-grid">
        {advisors.map((adv) => (
          <div
            key={adv._id}
            className={`advisor-card ${selectedAdvisorId === adv._id ? 'selected' : ''}`}
            onClick={() => setSelectedAdvisorId(adv._id)}
          >
            <img
              src={adv.image || getAvatarUrl(adv.name)}
              alt={adv.name}
              width="100"
              height="100"
              loading="lazy"
            />
            <h3>{adv.name}</h3>
            <p className="role">{adv.role || 'Real Estate Advisor'}</p>
            <div className="advisor-contact">
              <a href={`https://wa.me/91${adv.phone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href={`mailto:${adv.email}`}>Email</a>
              <span>📞 {adv.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Purpose & Property Type selection with Custom Dropdowns */}
      <div className="advisor-form-container">
        <h3>Tell us about your requirement</h3>
        
        {/* Purpose Dropdown */}
        <div className="form-group">
          <label>What are you looking for? *</label>
          <div className="custom-select-wrapper">
            <div 
              className="custom-select-trigger"
              onClick={() => setOpenPurpose(!openPurpose)}
            >
              <span className="selected-value">{getPurposeLabel()}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            {openPurpose && (
              <ul className="custom-options open">
                <li onClick={() => {
                  setPurpose('buying');
                  setPropertyType('');
                  setOpenPurpose(false);
                }}>Buying</li>
                <li onClick={() => {
                  setPurpose('renting');
                  setPropertyType('');
                  setOpenPurpose(false);
                }}>Renting</li>
              </ul>
            )}
          </div>
        </div>

        {/* Property Type Dropdown (only when purpose is buying) */}
        {purpose === 'buying' && (
          <div className="form-group">
            <label>Property Type *</label>
            <div className="custom-select-wrapper">
              <div 
                className="custom-select-trigger"
                onClick={() => setOpenPropertyType(!openPropertyType)}
              >
                <span className="selected-value">{getPropertyTypeLabel()}</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              {openPropertyType && (
                <ul className="custom-options open">
                  <li onClick={() => {
                    setPropertyType('apartmentBuilder');
                    setOpenPropertyType(false);
                  }}>Apartment / Builder Floor</li>
                  <li onClick={() => {
                    setPropertyType('plot');
                    setOpenPropertyType(false);
                  }}>Plot</li>
                </ul>
              )}
            </div>
          </div>
        )}

        <button className="btn-gold" onClick={handleOpenForm}>Continue</button>
      </div>

      <ReusableLeadForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        actionType="advisor"
        advisorId={selectedAdvisorId}
        purpose={purpose === 'buying' ? 'buying' : 'renting'}
        propertyType={propertyType}
      />
    </div>
  );
}

export default AdvisorPage;
