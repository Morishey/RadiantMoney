import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Import components
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Products from './components/Product';
import Business from './components/Business';
import Lending from './components/Lending';
import WhyChoose from './components/WhyChoose';
import Footer from './components/Footer';
import BankingDashboard from './components/BankingDashboard';
import DesktopBankingDashboard from './components/DesktopBankingDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SendMoney from './components/SendMoney'; // <-- IMPORT SENDMONEY

// Import pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Home Page Component
const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <About />
      <Products />
      <Business />
      <Lending />
      <WhyChoose />
      <Footer />
    </>
  );
};

function App() {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {isMobile ? <BankingDashboard /> : <DesktopBankingDashboard />}
                </ProtectedRoute>
              }
            />

            {/* Send Money Route – also protected */}
            <Route
              path="/send-money"
              element={
                <ProtectedRoute>
                  <SendMoney />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;