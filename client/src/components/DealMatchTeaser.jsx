import { Link } from 'react-router-dom';

function DealMatchTeaser() {
  return (
    <section className="deal-match-teaser">
      <div className="container">
        <div className="teaser-content">
          <h2>Not sure where to start?</h2>
          <p>Tell us your preferences – budget, location, property type – and we'll find the best matches for you. No spam, no pressure.</p>
          <Link to="/deal-match" className="btn-outline-gold">Find Your Match →</Link>
        </div>
      </div>
    </section>
  );
}

export default DealMatchTeaser;