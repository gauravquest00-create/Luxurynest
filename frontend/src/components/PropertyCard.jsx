import { Link } from 'react-router-dom';

function PropertyCard({ property }) {
  const { slug, title, location, unitDetails, images } = property;
  const imageUrl = images && images[0] ? images[0] : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Link to={`/property/${slug}`} className="property-card" aria-label={`View details for ${title}`}>
      <div className="property-image">
        <img 
          src={imageUrl} 
          alt={title} 
          loading="lazy" 
          width="400" 
          height="300"
        />
      </div>
      <div className="property-info">
        <h3>{title}</h3>
        <p className="location">{location}</p>
        <p className="price">{unitDetails?.price || 'Contact for price'}</p>
        <span className="type-badge">{unitDetails?.type || 'Property'}</span>
      </div>
    </Link>
  );
}

export default PropertyCard;