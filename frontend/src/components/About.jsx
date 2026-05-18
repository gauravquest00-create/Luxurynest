function About() {
  return (
    <section className="about">
      <div className="container">
        <div className="about-grid">
          {/* Left column: text */}
          <div className="about-text">
            <span className="about-tag">— OUR PROMISE</span>
            <h2>We don't sell homes. We guide decisions.</h2>
            <p>
              LuxuryNest is a professional advisory firm helping serious buyers find their next property
              through curated inventory, transparent process, and expert advisors.
            </p>
          </div>

          {/* Right column: three feature cards */}
          <div className="about-features">
            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <h3>Curated Inventory</h3>
              <p>Only premium, vetted properties.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Advisor-Led</h3>
              <p>Real humans, no chatbots.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚫</div>
              <h3>No Spam</h3>
              <p>Zero pressure, genuine assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;