import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 80) setVisible(false);
      else setVisible(true);
      setLastScroll(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  const isActive = (path) => location.pathname === path;

  // Smooth scroll to GetInTouch section
  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('getintouch');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${!visible ? 'hide' : ''}`}>
        <div className="container navbar">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="LuxuryNest Logo" className="logo-img" width="48" height="48" />
            <div className="logo-text">
              <h1>Luxury<span>Nest</span></h1>
              <p>YOUR PROPERTY OUR PRIORITY</p>
            </div>
          </Link>

          <nav className="nav-links">
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            <Link to="/deals" className={isActive('/deals') ? 'active' : ''}>Deals</Link>
            <Link to="/deal-match" className={isActive('/deal-match') ? 'active' : ''}>Deal Match</Link>
            <Link to="/advisor" className={isActive('/advisor') ? 'active' : ''}>Advisor</Link>
          </nav>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {menuOpen && (
     <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
  <button className="close-btn" onClick={() => setMenuOpen(false)}>×</button>
  <div className="mobile-logo">
    <img src="/logo.png" alt="Logo" className="mobile-logo-img" />
    <h2>Luxury<span>Nest</span></h2>
  </div>
  <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
  <Link to="/deals" onClick={() => setMenuOpen(false)}>Deals</Link>
  <Link to="/deal-match" onClick={() => setMenuOpen(false)}>Deal Match</Link>
  <Link to="/advisor" onClick={() => setMenuOpen(false)}>Advisor</Link>
</div>
      )}
    </>
  );
}

export default Header;