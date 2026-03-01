import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, Shield, Fingerprint, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const DEMO_CREDENTIALS = {
    email: 'john@crestbank.com',
    password: 'password123'
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Create user object and call context login
        const userData = {
          id: '1',
          name: 'John Anderson',
          email: email,
        };
        login(userData); // This updates context state and localStorage
        navigate('/dashboard');
      } else {
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password'
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
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
              <span className="logo-text">CrestcoastHub</span>
            </Link>

            <h1>Welcome Back!</h1>
            <p className="auth-subtitle">Access your secure banking dashboard and manage your finances with ease.</p>

            <div className="auth-features">
              <div className="feature-item">
                <Shield size={20} />
                <span>256-bit Encryption</span>
              </div>
              <div className="feature-item">
                <Fingerprint size={20} />
                <span>Biometric Ready</span>
              </div>
            </div>

            <div className="auth-testimonial">
              <p>"The most secure and user-friendly banking platform I've ever used."</p>
              <div className="testimonial-author">
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Please enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="enter email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
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

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-auth">
              <button className="social-btn google" disabled={isLoading}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className="social-btn apple" disabled={isLoading}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.69 3.56-1.702z" />
                </svg>
                Apple
              </button>
            </div>

            <p className="auth-prompt">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;