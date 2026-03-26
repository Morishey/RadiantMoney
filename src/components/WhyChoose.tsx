import React from 'react';
import { Eye, Target, Hand } from 'lucide-react';

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WhyChoose: React.FC = () => {
  const values: Value[] = [
    {
      icon: <Eye />,
      title: "Our Vision",
      description: "We're a values-driven bank committed to financing a brighter, greener, and more sustainable future."
    },
    {
      icon: <Target />,
      title: "Our Mission",
      description: "We strive to accelerate progress toward a low-carbon economy and drive prosperity through sustainable financing."
    },
    {
      icon: <Hand />,
      title: "Our Promise",
      description: "To be a trusted lender that moves as fast and as smart as you do."
    }
  ];

  return (
    <section className="why-choose">
      <div className="container">
        <div className="section-title">
          <h2>Why Partner with RadiantMoney?</h2>
          <p>Our commitment goes beyond banking to creating lasting value</p>
        </div>
        
        <div className="features-grid">
          {values.map((value, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {value.icon}
              </div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
