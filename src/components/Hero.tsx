import React from 'react';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroFeature {
  icon: React.ReactNode;
  text: string;
}

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const heroFeatures: HeroFeature[] = [
    { icon: <Shield />, text: "Bank-Grade Security" },
    { icon: <Zap />, text: "Lightning Fast" },
    { icon: <Lock />, text: "FDIC Insured" }
  ];

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">Fastest and Most</span>
            <br />
            Secured Banking
          </h1>
          <p className="hero-subtitle">
            Since 1992, we transformed the digital banking industry using data and technology 
            more than 10 years ago. Experience banking reimagined for the modern world.
          </p>
           <button 
            className="btn btn-primary btn-large"
            onClick={handleGetStarted}
          >
            GET STARTED
            <ArrowRight className="btn-icon" />
          </button> <br /> <br />
          <div className="hero-features">
            {heroFeatures.map((feature, index) => (
              <div key={index} className="hero-feature">
                {feature.icon}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
         
        </div>
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;