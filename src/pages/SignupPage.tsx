import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, User, Phone, CheckCircle } from 'lucide-react';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data (in real app, this would be an API call)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.fullName);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <Link to="/" className="auth-logo">
              <Building2 className="logo-icon" size={40} />
              <span className="logo-text">RadiantMoney</span>
            </Link>
            
            <h1>Join RadiantMoney</h1>
            <p className="auth-subtitle">Open your account in minutes and start banking securely.</p>
            
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={20} className="benefit-icon" />
                <div>
                  <strong>No monthly fees</strong>
                  <span>Free checking and savings</span>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={20} className="benefit-icon" />
                <div>
                  <strong>High-yield savings</strong>
                  <span>Earn up to 4.5% APY</span>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={20} className="benefit-icon" />
                <div>
                  <strong>24/7 support</strong>
                  <span>Customer service anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className={`input-wrapper ${errors.fullName ? 'error' : ''}`}>
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="John Anderson"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className={`input-wrapper ${errors.phone ? 'error' : ''}`}>
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-group terms-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span>
                    I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>
                  </span>
                </label>
                {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="auth-prompt">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;