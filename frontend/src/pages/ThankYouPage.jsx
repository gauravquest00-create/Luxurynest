import { useLocation, Link } from 'react-router-dom';

function ThankYouPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const name = params.get('name') || 'Guest';
  const source = params.get('source') || '';
  const propertyTitle = params.get('propertyTitle') || '';
  const propertyPrice = params.get('propertyPrice') || '';
  const propertyLocation = params.get('propertyLocation') || '';
  const detailsRaw = params.get('details');
  let details = {};

  if (detailsRaw) {
    try {
      details = JSON.parse(decodeURIComponent(detailsRaw));
    } catch (e) {}
  }

  return (
    <div className="container thankyou-page">
      <div className="thankyou-card">
        <div className="thankyou-header">
          <h1>Thank You, {name}!</h1>
          <p>Your request has been received</p>
        </div>
        <div className="thankyou-body">
          {propertyTitle && (
            <div className="summary-section">
              <h3>Property Details</h3>
              <div className="summary-grid">
                <div className="summary-item"><span className="summary-label">Property</span><span className="summary-value">{propertyTitle}</span></div>
                {propertyLocation && <div className="summary-item"><span className="summary-label">Location</span><span className="summary-value">{propertyLocation}</span></div>}
                {propertyPrice && <div className="summary-item"><span className="summary-label">Price</span><span className="summary-value">{propertyPrice}</span></div>}
              </div>
            </div>
          )}
          <div className="summary-section">
            <h3>Your Requirement Summary</h3>
            <div className="summary-grid">
              <div className="summary-item"><span className="summary-label">Name</span><span className="summary-value">{name}</span></div>
              <div className="summary-item"><span className="summary-label">Source</span><span className="summary-value">{source}</span></div>
              {Object.entries(details).map(([k, v]) => (
                <div className="summary-item" key={k}>
                  <span className="summary-label">{k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <span className="summary-value">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-section">
            <h3>What happens next?</h3>
            <p>Our advisor will review your request and contact you within 24 hours.</p>
          </div>
        </div>
        <div className="thankyou-footer">
          <Link to="/" className="btn-home">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;