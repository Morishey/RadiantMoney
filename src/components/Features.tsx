// components/Features.tsx
import React from 'react';
import { Shield, Clock, TrendingUp, Globe, Users, RefreshCw } from 'lucide-react';

// Define TypeScript interfaces
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}


const Features: React.FC = () => {
  const personalFeatures: Feature[] = [
    {
      icon: <Shield />,
      title: "FDIC Insured",
      description: "Your money is seamlessly insured by the full faith and credit of the federal government up to FDIC established limits."
    },
    {
      icon: <Clock />,
      title: "Easy to Open",
      description: "Online accounts opened in minutes. Start banking in under 5 minutes from any device."
    },
    {
      icon: <TrendingUp />,
      title: "Competitive Rates",
      description: "Earn higher interest while supporting sustainable initiatives. Your money grows with purpose."
    }
  ];

  const businessFeatures: Feature[] = [
    {
      icon: <RefreshCw />,
      title: "Low Carbon, High Performance",
      description: "Grow your business with a bank invested in low-carbon projects and sustainable growth."
    },
    {
      icon: <Users />,
      title: "Personalized Services",
      description: "Full suite of services with dedicated support teams that understand your business needs."
    },
    {
      icon: <Globe />,
      title: "Commitment to Sustainability",
      description: "Our decarbonization initiatives make doing good equally good for business."
    }
  ];

  return (
    <section id="personal" className="features">
      <div className="container">
        <div className="section-title">
          <h2>Personal Banking Benefits</h2>
          <p>Experience banking that puts your financial goals first while supporting a sustainable future</p>
        </div>
        
        <div className="features-grid">
          {personalFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="section-title" style={{ marginTop: '100px' }}>
          <h2>Business Banking Benefits</h2>
          <p id="business">Grow your business with banking that's committed to sustainability</p>
        </div>
        
        <div className="features-grid">
          {businessFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;