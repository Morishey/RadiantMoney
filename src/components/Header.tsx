// components/Header.tsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { Building2, Menu, X } from 'lucide-react'; // Changed Bank to Building2

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
            {/* FIXED: Using Building2 instead of Bank */}
            <Building2 className="logo-icon" />
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