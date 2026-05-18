import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <h2>Luxury<span>Nest</span></h2>
            <p>Your Property. Our Priority.</p>
            <p className="tagline">A real estate advisory firm – not a listing portal.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/deals">Deals</Link></li>
              <li><Link to="/deal-match">Deal Match</Link></li>
              <li><Link to="/advisor">Advisor</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <ul>
              <li>📞 <a href="tel:+919650796186">+91 96507 96186</a></li>
              <li>📞 <a href="tel:+919667435358">+91 96674 35358</a></li>
              <li>✉️ <a href="mailto:info@luxurynest.org.in">info@luxurynest.org.in</a></li>
              <li>📍 Gurgaon, Haryana (by appointment)</li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-icons">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/luxurynest.llp?utm_source=qr&igsh=b3ZreGU2a3NvZGN0" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="social-icon"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.81.25 2.23.42.56.22.96.49 1.38.91.42.42.69.82.91 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.81-.42 2.23-.22.56-.49.96-.91 1.38-.42.42-.82.69-1.38.91-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.81-.25-2.23-.42-.56-.22-.96-.49-1.38-.91-.42-.42-.69-.82-.91-1.38-.17-.42-.37-1.06-.42-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.81.42-2.23.22-.56.49-.96.91-1.38.42-.42.82-.69 1.38-.91.42-.17 1.06-.37 2.23-.42 1.27-.06 1.65-.07 4.85-.07zm0-1.6c-3.26 0-3.66.01-4.94.07-1.28.06-2.16.26-2.92.55-.8.3-1.48.7-2.16 1.38-.68.68-1.08 1.36-1.38 2.16-.29.76-.49 1.64-.55 2.92C2.01 8.34 2 8.74 2 12s.01 3.66.07 4.94c.06 1.28.26 2.16.55 2.92.3.8.7 1.48 1.38 2.16.68.68 1.36 1.08 2.16 1.38.76.29 1.64.49 2.92.55 1.28.06 1.68.07 4.94.07s3.66-.01 4.94-.07c1.28-.06 2.16-.26 2.92-.55.8-.3 1.48-.7 2.16-1.38.68-.68 1.08-1.36 1.38-2.16.29-.76.49-1.64.55-2.92.06-1.28.07-1.68.07-4.94s-.01-3.66-.07-4.94c-.06-1.28-.26-2.16-.55-2.92-.3-.8-.7-1.48-1.38-2.16-.68-.68-1.36-1.08-2.16-1.38-.76-.29-1.64-.49-2.92-.55-1.28-.06-1.68-.07-4.94-.07z" fill="currentColor"/>
                  <path d="M12 5.92c-3.36 0-6.08 2.72-6.08 6.08s2.72 6.08 6.08 6.08 6.08-2.72 6.08-6.08-2.72-6.08-6.08-6.08zm0 10.08c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="currentColor"/>
                  <circle cx="17.6" cy="6.4" r="1.2" fill="currentColor"/>
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href="https://youtube.com/@luxurynest-llp?si=F0w7mFO50ukRmSbt" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube"
                className="social-icon"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.54 6.42c-.18-.67-.71-1.2-1.38-1.38-1.22-.33-6.16-.33-6.16-.33s-4.94 0-6.16.33c-.67.18-1.2.71-1.38 1.38-.33 1.22-.33 3.58-.33 3.58s0 2.36.33 3.58c.18.67.71 1.2 1.38 1.38 1.22.33 6.16.33 6.16.33s4.94 0 6.16-.33c.67-.18 1.2-.71 1.38-1.38.33-1.22.33-3.58.33-3.58s0-2.36-.33-3.58z" fill="currentColor"/>
                  <path d="M9.75 8.38l5.5 3.12-5.5 3.12V8.38z" fill="white"/>
                </svg>
              </a>

              {/* LinkedIn – placeholder (can be replaced with actual LinkedIn URL) */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn"
                className="social-icon"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.45 20.45h-3.56v-5.52c0-1.32-.03-3.02-1.84-3.02-1.84 0-2.12 1.44-2.12 2.93v5.61H9.37V9h3.42v1.56h.05c.48-.9 1.64-1.84 3.36-1.84 3.6 0 4.26 2.37 4.26 5.45v6.28h.01zM5.34 7.56a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM3.24 20.45h4.2V9h-4.2v11.45z" fill="currentColor"/>
                </svg>
              </a>
            </div>
            <p className="copyright">© {new Date().getFullYear()} LuxuryNest. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;