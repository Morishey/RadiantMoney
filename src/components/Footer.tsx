import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

interface QuickLink {
  label: string;
  section: string;
}

const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const quickLinks: QuickLink[] = [
    { label: 'Personal Banking', section: 'personal' },
    { label: 'Business Banking', section: 'business' },
    { label: 'Lending Solutions', section: 'lending' },
    { label: 'About Us', section: 'about' },
  ];

  const products: string[] = [
    'Secure Large Deposits',
    'Business Credit Cards',
    'Treasury Services',
    'Financial Tips',
    'Career Opportunities'
  ];

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>RadiantMoney</h3>
            <p>
              As a community bank, we are deeply involved with the specific needs of local people, 
              families, and businesses.
            </p>
            <div className="newsletter-form">
              <h4>Stay Updated</h4>
              <form onSubmit={handleSubmit} className="newsletter-input">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  {submitted ? <CheckCircle /> : <Send />}
                </button>
              </form>
              {submitted && (
                <div className="success-message">
                  Thank you for subscribing!
                </div>
              )}
            </div>
          </div>
          
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => scrollToSection(link.section)}
                    className="footer-link"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Additional Products</h3>
            <ul>
              {products.map((product, index) => (
                <li key={index}>
                  <a href="#" className="footer-link">
                    {product}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Contact Information</h3>
            <ul className="contact-info">
              <li>
                <MapPin className="contact-icon" />
                <span>123 Ocean Drive, Suite 100<br />San Francisco, CA 94105</span>
              </li>
              <li>
                <Phone className="contact-icon" />
                <span>(555) 123-4567</span>
              </li>
              <li>
                <Mail className="contact-icon" />
                <span>info@RadiantMoney.com</span>
              </li>
              <li>
                <Clock className="contact-icon" />
                <span>Mon-Fri: 9am-6pm PST<br />Sat: 10am-2pm PST</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} RadiantMoney. All Rights Reserved.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
