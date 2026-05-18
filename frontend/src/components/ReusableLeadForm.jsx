import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Reusable.css'; // Import CSS

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ReusableLeadForm({
  isOpen,
  onClose,
  actionType,
  propertySlug,
  propertyTitle,
  propertyPrice,
  propertyLocation,
  advisorId,
  purpose,
  propertyType,
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    configuration: '',
    budget: '',
    buyingPurpose: '',
    timeline: '',
    plotSize: '',
    rentSize: '',
    furnishing: '',
    preferredTime: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const [sendOtpFailed, setSendOtpFailed] = useState(false);

  // Dropdown states
  const [openLocation, setOpenLocation] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [openBuyingPurpose, setOpenBuyingPurpose] = useState(false);
  const [openTimeline, setOpenTimeline] = useState(false);
  const [openRentSize, setOpenRentSize] = useState(false);
  const [openFurnishing, setOpenFurnishing] = useState(false);
  const [openPreferredTime, setOpenPreferredTime] = useState(false);

  // Store-first flow
  const [storedLeadId, setStoredLeadId] = useState(null);

  // Options arrays
  const locationOptions = ['New Gurgaon', 'SPR', 'Golf Course', 'Golf Course Extension', 'Dwarka Expressway'];
  const configOptions = ['1BHK', '2BHK', '3BHK', '4BHK', '4BHK+'];
  const buyingPurposeOptions = ['Self-use', 'Investment'];
  const timelineOptionsBuy = ['Immediate', '3 months', '6+ months'];
  const timelineOptionsRent = ['Immediate', '1 month', '3 months'];
  const rentSizeOptions = ['1BHK', '2BHK', '3BHK', '4BHK+'];
  const furnishingOptions = ['Any', 'Unfurnished', 'Semi-furnished', 'Fully furnished'];
  const preferredTimeOptions = ['Any time', 'Morning (9AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // Validation (same as original)
  const validate = () => {
    const newErrors = {};
    const namePattern = /^[A-Za-z\s\-]+$/;
    if (!formData.name?.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (!namePattern.test(formData.name.trim())) newErrors.name = 'Name must contain only letters, spaces, or hyphens (no digits)';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!emailPattern.test(formData.email)) newErrors.email = 'Enter a valid email address';

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    else if (phoneDigits.length !== 10) newErrors.phone = 'Phone number must be exactly 10 digits';
    else if (!/^[6-9]/.test(phoneDigits)) newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';

    if (actionType === 'advisor') {
      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.timeline) newErrors.timeline = 'Timeline is required';
      if (purpose === 'buying') {
        if (propertyType === 'apartmentBuilder') {
          if (!formData.configuration) newErrors.configuration = 'Configuration (BHK) required';
          if (!formData.budget) newErrors.budget = 'Budget required';
          if (!formData.buyingPurpose) newErrors.buyingPurpose = 'Purpose of buying required';
        } else if (propertyType === 'plot') {
          if (!formData.plotSize) newErrors.plotSize = 'Plot size required';
          if (!formData.buyingPurpose) newErrors.buyingPurpose = 'Purpose of use required';
        }
      } else if (purpose === 'renting') {
        if (!formData.rentSize) newErrors.rentSize = 'Size required';
        if (!formData.budget) newErrors.budget = 'Budget required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API functions (same as original)
  const requestOtp = async (phoneDigits) => {
    try {
      const res = await axios.post(`${API_BASE}/otp/send`, { phone: phoneDigits });
      return res.data.success;
    } catch (err) {
      console.error('OTP send failed:', err);
      return false;
    }
  };

  const verifyOtp = async (phoneDigits, otp) => {
    try {
      const res = await axios.post(`${API_BASE}/otp/verify`, { phone: phoneDigits, otp });
      return res.data.success;
    } catch (err) {
      console.error('OTP verify failed:', err);
      return false;
    }
  };

  const submitLead = async (phoneVerified) => {
    setLoading(true);
    try {
      let source = '';
      let requirementDetails = {};

      if (actionType === 'advisor') {
        source = 'advisor_page';
        requirementDetails = { purpose };
        if (purpose === 'buying') {
          requirementDetails.propertyType = propertyType === 'apartmentBuilder' ? 'apartment/builder' : 'plot';
        }
        requirementDetails.location = formData.location;
        requirementDetails.timeline = formData.timeline;
        if (purpose === 'buying') {
          if (propertyType === 'apartmentBuilder') {
            requirementDetails.configuration = formData.configuration;
            requirementDetails.budget = formData.budget;
            requirementDetails.buyingPurpose = formData.buyingPurpose;
          } else {
            requirementDetails.plotSize = `${formData.plotSize} sqyd`;
            requirementDetails.buyingPurpose = formData.buyingPurpose;
          }
        } else if (purpose === 'renting') {
          requirementDetails.rentSize = formData.rentSize;
          requirementDetails.budget = formData.budget;
          if (formData.furnishing) requirementDetails.furnishing = formData.furnishing;
        }
      } else {
        source = 'property_detail';
        if (actionType === 'callback') {
          requirementDetails = {
            action: 'callback_request',
            propertyTitle,
            preferredTime: formData.preferredTime,
            message: formData.message,
          };
        } else if (actionType === 'brochure') {
          requirementDetails = { action: 'brochure_download', propertyTitle };
        } else {
          requirementDetails = { action: 'full_details', propertyTitle };
        }
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        propertySlug: propertySlug || null,
        advisorId: advisorId || null,
        source,
        requirementDetails,
        phoneVerified,
      };

      const response = await axios.post(`${API_BASE}/leads`, payload);
      const params = new URLSearchParams();
      params.append('name', formData.name);
      params.append('source', source);
      if (propertyTitle) params.append('propertyTitle', propertyTitle);
      if (propertyPrice) params.append('propertyPrice', propertyPrice);
      if (propertyLocation) params.append('propertyLocation', propertyLocation);
      params.append('details', JSON.stringify(requirementDetails));
      params.append('verified', phoneVerified);
      navigate(`/thank-you?${params.toString()}`);
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setLoading(false);
      setShowOtpModal(false);
      setPendingSubmission(false);
    }
  };

  const buildPayloadUnverified = () => {
    let source = '';
    let requirementDetails = {};
    if (actionType === 'advisor') {
      source = 'advisor_page';
      requirementDetails = { purpose };
      if (purpose === 'buying') requirementDetails.propertyType = propertyType === 'apartmentBuilder' ? 'apartment/builder' : 'plot';
      requirementDetails.location = formData.location;
      requirementDetails.timeline = formData.timeline;
      if (purpose === 'buying') {
        if (propertyType === 'apartmentBuilder') {
          requirementDetails.configuration = formData.configuration;
          requirementDetails.budget = formData.budget;
          requirementDetails.buyingPurpose = formData.buyingPurpose;
        } else {
          requirementDetails.plotSize = `${formData.plotSize} sqyd`;
          requirementDetails.buyingPurpose = formData.buyingPurpose;
        }
      } else if (purpose === 'renting') {
        requirementDetails.rentSize = formData.rentSize;
        requirementDetails.budget = formData.budget;
        if (formData.furnishing) requirementDetails.furnishing = formData.furnishing;
      }
    } else {
      source = 'property_detail';
      if (actionType === 'callback') {
        requirementDetails = { action: 'callback_request', propertyTitle, preferredTime: formData.preferredTime, message: formData.message };
      } else if (actionType === 'brochure') {
        requirementDetails = { action: 'brochure_download', propertyTitle };
      } else {
        requirementDetails = { action: 'full_details', propertyTitle };
      }
    }
    return {
      name: formData.name,
      email: formData.email,
      phone: formData.phone.replace(/\D/g, ''),
      propertySlug: propertySlug || null,
      advisorId: advisorId || null,
      source,
      requirementDetails,
      phoneVerified: false,
    };
  };

  const storeLeadUnverified = async () => {
    const payload = buildPayloadUnverified();
    const response = await axios.post(`${API_BASE}/leads`, payload);
    return response.data.leadId;
  };

  const updateLeadVerified = async (leadId) => {
    await axios.patch(`${API_BASE}/leads/${leadId}/verify-phone`);
  };

  const redirectToThankYou = (verified) => {
    const params = new URLSearchParams();
    params.append('name', formData.name);
    params.append('verified', verified);
    if (propertyTitle) params.append('propertyTitle', propertyTitle);
    if (propertyPrice) params.append('propertyPrice', propertyPrice);
    if (propertyLocation) params.append('propertyLocation', propertyLocation);
    navigate(`/thank-you?${params.toString()}`);
    onClose();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    let leadId = null;
    try {
      leadId = await storeLeadUnverified();
      setStoredLeadId(leadId);
    } catch (err) {
      console.error('Failed to store lead:', err);
      alert('Could not save your details. Please try again.');
      setLoading(false);
      return;
    }
    setLoading(false);

    setOtpLoading(true);
    setOtpError('');
    const otpSent = await requestOtp(phoneDigits);
    setOtpLoading(false);

    if (!otpSent) {
      const confirmSubmit = window.confirm(
        'OTP could not be sent due to technical issues. Your request has been saved. Our team will contact you shortly.'
      );
      if (confirmSubmit) redirectToThankYou(false);
      return;
    }

    setShowOtpModal(true);
    setOtpValue('');
    setOtpError('');
    setOtpVerified(false);
    setPendingSubmission(true);
  };

  const handleVerifyOtp = async () => {
    if (!otpValue.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const isValid = await verifyOtp(phoneDigits, otpValue);
    setOtpLoading(false);

    if (isValid) {
      if (storedLeadId) {
        await updateLeadVerified(storedLeadId);
      }
      setShowOtpModal(false);
      redirectToThankYou(true);
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleSubmitWithoutOtp = async () => {
    setShowOtpModal(false);
    const confirmSubmit = window.confirm(
      'Your phone number is not verified. Submitting without verification may delay our response. Do you want to continue?'
    );
    if (confirmSubmit) {
      redirectToThankYou(false);
    } else {
      setPendingSubmission(false);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setPendingSubmission(false);
    alert('Your details have been saved. We will contact you soon.');
    onClose();
  };

  if (!isOpen) return null;

  // Advisor Form with Custom Dropdowns
  if (actionType === 'advisor') {
    return (
      <>
        <div className="lead-modal-overlay" onClick={onClose}>
          <div className="lead-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="lead-modal-close" onClick={onClose}>×</button>
            <h3>Share Your Requirement</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                {/* Location Custom Dropdown */}
                <div className="form-group">
                  <label>Location *</label>
                  <div className="custom-select-wrapper">
                    <div className="custom-select-trigger" onClick={() => setOpenLocation(!openLocation)}>
                      <span className="selected-value">{formData.location || 'Select Location'}</span>
                      <i className="fas fa-chevron-down"></i>
                    </div>
                    {openLocation && (
                      <ul className="custom-options">
                        {locationOptions.map(opt => (
                          <li key={opt} onClick={() => {
                            handleChange({ target: { name: 'location', value: opt } });
                            setOpenLocation(false);
                          }}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {errors.location && <span className="error-text">{errors.location}</span>}
                </div>
              </div>

              {/* Buying – Apartment/Builder fields */}
              {purpose === 'buying' && propertyType === 'apartmentBuilder' && (
                <>
                  <div className="form-row">
                    {/* Configuration Custom Dropdown */}
                    <div className="form-group">
                      <label>Configuration *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenConfig(!openConfig)}>
                          <span className="selected-value">{formData.configuration || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openConfig && (
                          <ul className="custom-options">
                            {configOptions.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'configuration', value: opt } });
                                setOpenConfig(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.configuration && <span className="error-text">{errors.configuration}</span>}
                    </div>
                    <div className="form-group">
                      <label>Budget Range *</label>
                      <input type="text" name="budget" placeholder="e.g., 1.5-2 Cr" value={formData.budget} onChange={handleChange} />
                      {errors.budget && <span className="error-text">{errors.budget}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    {/* Buying Purpose Custom Dropdown */}
                    <div className="form-group">
                      <label>Purpose of Buying *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenBuyingPurpose(!openBuyingPurpose)}>
                          <span className="selected-value">{formData.buyingPurpose || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openBuyingPurpose && (
                          <ul className="custom-options">
                            {buyingPurposeOptions.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'buyingPurpose', value: opt } });
                                setOpenBuyingPurpose(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.buyingPurpose && <span className="error-text">{errors.buyingPurpose}</span>}
                    </div>

                    {/* Timeline Custom Dropdown */}
                    <div className="form-group">
                      <label>Timeline *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenTimeline(!openTimeline)}>
                          <span className="selected-value">{formData.timeline || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openTimeline && (
                          <ul className="custom-options">
                            {timelineOptionsBuy.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'timeline', value: opt } });
                                setOpenTimeline(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.timeline && <span className="error-text">{errors.timeline}</span>}
                    </div>
                  </div>
                </>
              )}

              {/* Buying – Plot fields */}
              {purpose === 'buying' && propertyType === 'plot' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Plot Area (sqyd) *</label>
                      <input type="number" name="plotSize" value={formData.plotSize} onChange={handleChange} min="60" />
                      {errors.plotSize && <span className="error-text">{errors.plotSize}</span>}
                    </div>
                    <div className="form-group">
                      <label>Purpose of Use *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenBuyingPurpose(!openBuyingPurpose)}>
                          <span className="selected-value">{formData.buyingPurpose || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openBuyingPurpose && (
                          <ul className="custom-options">
                            {buyingPurposeOptions.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'buyingPurpose', value: opt } });
                                setOpenBuyingPurpose(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.buyingPurpose && <span className="error-text">{errors.buyingPurpose}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Timeline *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenTimeline(!openTimeline)}>
                          <span className="selected-value">{formData.timeline || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openTimeline && (
                          <ul className="custom-options">
                            {timelineOptionsBuy.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'timeline', value: opt } });
                                setOpenTimeline(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.timeline && <span className="error-text">{errors.timeline}</span>}
                    </div>
                  </div>
                </>
              )}

              {/* Renting fields */}
              {purpose === 'renting' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Size *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenRentSize(!openRentSize)}>
                          <span className="selected-value">{formData.rentSize || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openRentSize && (
                          <ul className="custom-options">
                            {rentSizeOptions.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'rentSize', value: opt } });
                                setOpenRentSize(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.rentSize && <span className="error-text">{errors.rentSize}</span>}
                    </div>
                    <div className="form-group">
                      <label>Monthly Budget (₹) *</label>
                      <input type="text" name="budget" placeholder="e.g., 30,000" value={formData.budget} onChange={handleChange} />
                      {errors.budget && <span className="error-text">{errors.budget}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Timeline *</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenTimeline(!openTimeline)}>
                          <span className="selected-value">{formData.timeline || 'Select'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openTimeline && (
                          <ul className="custom-options">
                            {timelineOptionsRent.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'timeline', value: opt } });
                                setOpenTimeline(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors.timeline && <span className="error-text">{errors.timeline}</span>}
                    </div>
                    <div className="form-group">
                      <label>Furnishing (optional)</label>
                      <div className="custom-select-wrapper">
                        <div className="custom-select-trigger" onClick={() => setOpenFurnishing(!openFurnishing)}>
                          <span className="selected-value">{formData.furnishing || 'Any'}</span>
                          <i className="fas fa-chevron-down"></i>
                        </div>
                        {openFurnishing && (
                          <ul className="custom-options">
                            {furnishingOptions.map(opt => (
                              <li key={opt} onClick={() => {
                                handleChange({ target: { name: 'furnishing', value: opt } });
                                setOpenFurnishing(false);
                              }}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="lead-modal-overlay" onClick={handleCloseOtpModal}>
            <div className="lead-modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
              <button className="lead-modal-close" onClick={handleCloseOtpModal}>×</button>
              <h3>Verify Your Mobile Number</h3>
              <p>OTP sent to <strong>{formData.phone}</strong></p>
              <div className="form-group">
                <label>Enter OTP</label>
                <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="123456" />
                {otpError && <span className="error-text">{otpError}</span>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleSubmitWithoutOtp}>Submit Without Verification</button>
                <button type="button" className="btn-primary" onClick={handleVerifyOtp} disabled={otpLoading}>
                  {otpLoading ? 'Verifying...' : 'Verify & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Property Page Actions (details, callback, brochure)
  let modalTitle = '';
  let extraFields = null;
  if (actionType === 'callback') {
    modalTitle = 'Request a Call Back';
    extraFields = (
      <>
        <div className="form-group">
          <label>Preferred Time (optional)</label>
          <div className="custom-select-wrapper">
            <div className="custom-select-trigger" onClick={() => setOpenPreferredTime(!openPreferredTime)}>
              <span className="selected-value">{formData.preferredTime || 'Any time'}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            {openPreferredTime && (
              <ul className="custom-options">
                {preferredTimeOptions.map(opt => (
                  <li key={opt} onClick={() => {
                    handleChange({ target: { name: 'preferredTime', value: opt } });
                    setOpenPreferredTime(false);
                  }}>{opt}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Message (optional)</label>
          <textarea name="message" rows="2" placeholder="Any specific query?" value={formData.message || ''} onChange={handleChange}></textarea>
        </div>
      </>
    );
  } else if (actionType === 'brochure') {
    modalTitle = 'Download Brochure';
  } else {
    modalTitle = 'Request Full Details';
  }

  return (
    <>
      <div className="lead-modal-overlay" onClick={onClose}>
        <div className="lead-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="lead-modal-close" onClick={onClose}>×</button>
          <h3>{modalTitle}</h3>
          {propertyTitle && <p className="modal-property">{propertyTitle}</p>}
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            {extraFields}
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="lead-modal-overlay" onClick={handleCloseOtpModal}>
          <div className="lead-modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <button className="lead-modal-close" onClick={handleCloseOtpModal}>×</button>
            <h3>Verify Your Mobile Number</h3>
            <p>OTP sent to <strong>{formData.phone}</strong></p>
            <div className="form-group">
              <label>Enter OTP</label>
              <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="123456" />
              {otpError && <span className="error-text">{otpError}</span>}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={handleSubmitWithoutOtp}>Submit Without Verification</button>
              <button type="button" className="btn-primary" onClick={handleVerifyOtp} disabled={otpLoading}>
                {otpLoading ? 'Verifying...' : 'Verify & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReusableLeadForm;