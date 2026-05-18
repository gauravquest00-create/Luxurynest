import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/deals');
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-badge">WELCOME TO LUXURYNEST</div>
        <h1 className="hero-title">
          Your Property. <span className="hero-title-accent">Our Priority.</span>
        </h1>
        <p className="hero-description">
          A real estate advisory firm – not a listing portal.<br />
          We help you make the right move with clarity, expertise, and care.
        </p>
        <button className="hero-btn" onClick={handleClick}>
          Explore Properties
        </button>

        {/* Three feature cards */}
        <div className="hero-features">
          <div className="hero-feature">
            <h3>Curated Properties</h3>
            <p>Handpicked & verified opportunities only.</p>
          </div>
          <div className="hero-feature">
            <h3>Expert Advisors</h3>
            <p>Personal guidance from real estate professionals.</p>
          </div>
          <div className="hero-feature">
            <h3>Client First</h3>
            <p>Transparent process. Always your best interest.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;