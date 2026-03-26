import React from 'react';
import { Users, MapPin, Award, UserCheck, Target, Hand } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const About: React.FC = () => {
  const stats: Stat[] = [
    { icon: <Users />, value: "193", label: "Employees" },
    { icon: <MapPin />, value: "10+", label: "Locations" },
    { icon: <Award />, value: "15", label: "Awards Winning" },
    { icon: <UserCheck />, value: "700000", label: "Customers" }
  ];

  const values: Value[] = [
    {
      icon: <Target />,
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
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2>About RadiantMoney Savings Bank</h2>
            <p>
              As a community bank, we are deeply involved with the specific needs of local people, 
              families, and businesses. For a long time now, we have provided banking services that 
              enable those in our community to lead financially productive lives.
            </p>
            <p>
              To make sure that the area where we live and work remains vibrant and continues to grow, 
              the focus of our activities is on customers within our community.
            </p>
            
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="values-section">
            <h3>Why Partner with RadiantMoney?</h3>
            <div className="values-grid">
              {values.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon">{value.icon}</div>
                  <h4>{value.title}</h4>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
