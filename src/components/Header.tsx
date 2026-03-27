// components/Header.tsx - Using favicon as logo
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react'; // Removed Building2 import

interface NavItem {
  label: string;
  section: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const navItems: NavItem[] = [
    { label: 'Personal Banking', section: 'personal' },
    { label: 'Business Banking', section: 'business' },
    { label: 'Lending Solutions', section: 'lending' },
    { label: 'About Us', section: 'about' },
  ];

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="nav-container">
          <a href="/" className="logo">
            {/* Using favicon as logo */}
            <img src="/favicon.svg" alt="RadiantMoney" className="logo-icon" />
            <span>RadiantMoney</span>
          </a>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {navItems.map((item) => (
              <button 
                key={item.section}
                className="nav-link"
                onClick={() => scrollToSection(item.section)}
              >
                {item.label}
              </button>
            ))}
            <button 
              className="btn btn-outline"
              onClick={() => scrollToSection('contact')}
            >
              Contact Us
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;