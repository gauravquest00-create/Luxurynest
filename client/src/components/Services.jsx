import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const services = [
  { type: 'resale', title: 'Resale', icon: '🏠', description: 'Carefully vetted resale properties with negotiation support' },
  { type: 'rent', title: 'Rent', icon: '🔑', description: 'Premium rental homes with flexible terms' },
  { type: 'floor', title: 'Floor', icon: '🏢', description: 'Builder floors with independent privacy' },
  { type: 'plot', title: 'Plot', icon: '🌳', description: 'Residential plots in prime locations' },
];

function Services() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleClick = (type) => {
    navigate(`/deals?type=${type}`);
  };

  return (
    <section className="services">
      <div className="container">
        <h2 className="section-title">What We Do</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service.type}
              className="service-card"
              onMouseEnter={() => setHovered(service.type)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(service.type)}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              {hovered === service.type && (
                <div className="service-overlay">
                  <span>View {service.title} Deals</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;