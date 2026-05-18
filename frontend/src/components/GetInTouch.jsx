import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://luxurynest.onrender.com/api';

function GetInTouch() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Simple lead submission (no OTP for contact form)
      await axios.post(`${API_BASE}/leads`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: 'contact_form',
        requirementDetails: { message: formData.message },
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
<section id="getintouch" className="getintouch">
        <div className="container">
          <div className="getintouch-card">
            <h3>Thank you for reaching out!</h3>
            <p>We'll get back to you within 24 hours.</p>
            <button onClick={() => setSubmitted(false)} className="btn-outline-gold">
              Send another message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="getintouch">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Get in Touch</span>
          <h2 className="section-title">We’d love to hear from you</h2>
          <p>Whether you have a question or a specific requirement, our team is ready to help.</p>
        </div>

        <div className="getintouch-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject (optional)</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Message *</label>
              <textarea
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" disabled={loading} className="btn-gold">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="contact-info">
            <div className="info-item">
              <span>📞</span>
              <div>
                <strong>Call us</strong>
                <a href="tel:+919650796186">+91 96507 96186</a>
                <a href="tel:+919667435358">+91 96674 35358</a>
              </div>
            </div>
            <div className="info-item">
              <span>✉️</span>
              <div>
                <strong>Email us</strong>
                <a href="mailto:info@luxurynest.org.in">info@luxurynest.org.in</a>
              </div>
            </div>
            <div className="info-item">
              <span>📍</span>
              <div>
                <strong>Visit us</strong>
                <p>Gurgaon, Haryana (by appointment only)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GetInTouch;
