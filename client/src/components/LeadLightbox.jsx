import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LeadLightbox({ isOpen, onClose, propertySlug, propertyTitle, advisorId }) {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'details'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/otp/send`, { phone });
      setOtpSent(true);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/otp/verify`, { phone, otp });
      if (res.data.success) {
        setStep('details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/leads`, {
        name,
        email,
        phone,
        propertySlug,
        advisorId,
        source: 'property_detail',
        requirementDetails: { propertyTitle },
      });
      // Redirect to thank you page
      window.location.href = `/thank-you?name=${encodeURIComponent(name)}&property=${encodeURIComponent(propertyTitle)}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>×</button>
        <h3>Request Full Details</h3>
        <p className="lightbox-property">{propertyTitle}</p>

        {step === 'phone' && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="10-digit mobile number"
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Enter OTP sent to {phone}</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="6-digit OTP"
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmitLead}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone (verified)</label>
              <input type="text" value={phone} disabled />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LeadLightbox;