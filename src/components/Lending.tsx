import React from 'react';
import { SunMedium, Building, Heart, ArrowRight } from 'lucide-react';

interface LendingProps {
  title?: string;
  subtitle?: string;
  onExplore?: (verticalId: string) => void;
}

interface LendingVertical {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}

const Lending: React.FC<LendingProps> = ({ 
  title = "Our Lending Verticals",
  subtitle = "Specialized financing solutions for a sustainable future",
  onExplore 
}) => {
  const lendingVerticals: LendingVertical[] = [
    {
      id: 'energy',
      icon: SunMedium,
      title: "Energy Loan Network",
      subtitle: "Helping you plug into your sustainable energy goals.",
      description: "Connects contractors and residential homeowners to affordable financing options for home energy upgrades.",
      cta: "Explore Energy Financing"
    },
    {
      id: 'commercial',
      icon: Building,
      title: "Commercial Property Assessed Clean Energy",
      subtitle: "Helping businesses do their part.",
      description: "Offers financing for renewable energy projects like solar power, energy efficiency upgrades, and seismic strengthening.",
      cta: "Explore Commercial Financing"
    },
    {
      id: 'healthcare',
      icon: Heart,
      title: "Healthcare",
      subtitle: "Taking care of those who take care of others",
      description: "Support healthcare companies both large and small with custom financing solutions.",
      cta: "Explore Healthcare Financing"
    }
  ];

  const handleExploreClick = (verticalId: string) => {
    if (onExplore) {
      onExplore(verticalId);
    } else {
      console.log(`Exploring ${verticalId} financing options`);
      // Default behavior - could be navigation or modal trigger
      // window.location.href = `/lending/${verticalId}`;
    }
  };

  return (
    <section id="lending" className="lending" aria-labelledby="lending-title">
      <div className="container">
        <div className="section-title">
          <h2 id="lending-title">{title}</h2>
          <p>{subtitle}</p>
        </div>
        
        <div className="lending-grid" role="list">
          {lendingVerticals.map(({ id, icon: Icon, title, subtitle, description, cta }) => (
            <article key={id} className="lending-card" role="listitem">
              <div className="lending-header">
                <div className="lending-icon" aria-hidden="true">
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <h3>{title}</h3>
              </div>
              
              <div className="lending-body">
                <h4>{subtitle}</h4>
                <p>{description}</p>
                
                <button 
                  className="btn btn-outline"
                  onClick={() => handleExploreClick(id)}
                  aria-label={`Explore ${title} financing options`}
                >
                  <span>{cta}</span>
                  <ArrowRight className="btn-icon" size={18} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Lending;