// components/Products.js
import React from 'react';
import { TrendingUp, Wallet, PiggyBank, Globe, CreditCard, ArrowRight } from 'lucide-react';

const Products = () => {
  const products = [
    {
      icon: <TrendingUp />,
      title: "Certificates of Deposit",
      subtitle: "You earn for the future; we invest in a brighter future.",
      description: "Every cent you save earns interest for you and helps support a brighter future. RadiantMoney is committed to financing sustainable businesses and clean energy projects.",
      color: "blue"
    },
    {
      icon: <Wallet />,
      title: "Checking & Money Market",
      subtitle: "Easy on you, and the environment.",
      description: "Support a greener, more sustainable future while earning interest towards your financial goals. Maximize your returns and ensure your money is ready when you need it.",
      color: "teal"
    },
    {
      icon: <PiggyBank />,
      title: "Savings",
      subtitle: "Earn interest, with impact.",
      description: "Our savings account options offer competitive rates, easy-to-open accounts, and FDIC insurance up to established limits. Go green with e-statements and online banking.",
      color: "purple"
    },
    {
      icon: <Globe />,
      title: "Retirement",
      subtitle: "Enjoy your next phase while phasing out carbon emissions",
      description: "Wherever you see yourself in retirement, RadiantMoney's options have you covered. With multiple IRA solutions to choose from, you can save for a future that works for everyone.",
      color: "orange"
    },
    {
      icon: <CreditCard />,
      title: "Credit Cards",
      subtitle: "Reducing carbon emissions one card at a time",
      description: "Choosing the right credit card for you is easier than ever – whether you want to pay down balances faster, maximize cash back, or earn rewards.",
      color: "green"
    }
  ];

  return (
    <section className="products">
      <div className="container">
        <div className="section-title">
          <h2>Our Personal Banking Products</h2>
          <p>Financial products designed for your goals and the planet's future</p>
        </div>
        
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={index} className={`product-card product-${product.color}`}>
              <div className="product-icon">
                {product.icon}
              </div>
              <h3>{product.title}</h3>
              <h4>{product.subtitle}</h4>
              <p>{product.description}</p>
              <button className="btn btn-ghost">
                Learn More
                <ArrowRight className="btn-icon" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;