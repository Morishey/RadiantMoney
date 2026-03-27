import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, Shield, Fingerprint, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    general?: string;
    field?: 'email' | 'password' | null;
  }>({});
  const [blockedTime, setBlockedTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const DEMO_CREDENTIALS = {
    email: 'Samanichhomes12@gmail.com',
    password: 'Bchris4great01'
  };

  const ADMIN_CREDENTIALS = {
    email: 'admin@RadiantMoney.com',
    password: 'admin123'
  };

  // Check if email is blocked on input change
  useEffect(() => {
    if (email) {
      checkIfBlocked(email);
    }
  }, [email]);

  // Countdown timer for blocked accounts
  useEffect(() => {
    if (blockedTime) {
      const updateCountdown = () => {
        const now = Date.now();
        const remaining = blockedTime - now;
        
        if (remaining <= 0) {
          setBlockedTime(null);
          setCountdown('');
          return;
        }
        
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        setCountdown(`${hours}h ${minutes}m`);
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);
      
      return () => clearInterval(interval);
    }
  }, [blockedTime]);

  const checkIfBlocked = async (emailToCheck: string) => {
    try {
      const response = await fetch(`/api/login-attempts?email=${encodeURIComponent(emailToCheck)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.blockedUntil) {
          setBlockedTime(data.blockedUntil);
        } else {
          setBlockedTime(null);
        }
      }
    } catch (error) {
      const attempts = JSON.parse(localStorage.getItem(`login_attempts_${emailToCheck.toLowerCase()}`) || 'null');
      if (attempts?.blockedUntil && attempts.blockedUntil > Date.now()) {
        setBlockedTime(attempts.blockedUntil);
      } else {
        setBlockedTime(null);
      }
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; field?: 'email' | 'password' | null } = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email address is required';
      newErrors.field = 'email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
      newErrors.field = 'email';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      if (!newErrors.field) newErrors.field = 'password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      if (!newErrors.field) newErrors.field = 'password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).filter(key => key !== 'field').length === 0;
  };

  const recordFailedAttempt = async (emailToRecord: string) => {
    try {
      const response = await fetch('/api/login-attempts/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToRecord })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      const normalizedEmail = emailToRecord.toLowerCase();
      const key = `login_attempts_${normalizedEmail}`;
      const now = Date.now();
      const MAX_ATTEMPTS = 3;
      const COOLDOWN_HOURS = 24;
      const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;
      
      let attempts = JSON.parse(localStorage.getItem(key) || 'null') || { count: 0, firstAttemptTime: 0 };
      
      if (attempts.blockedUntil && now < attempts.blockedUntil) {
        return { blocked: true, blockedUntil: attempts.blockedUntil };
      }
      
      if (attempts.count === 0) {
        attempts = { count: 1, firstAttemptTime: now };
      } else {
        if (now - attempts.firstAttemptTime > 60 * 60 * 1000) {
          attempts.count = 1;
          attempts.firstAttemptTime = now;
        } else {
          attempts.count += 1;
        }
      }
      
      if (attempts.count >= MAX_ATTEMPTS) {
        attempts.blockedUntil = now + COOLDOWN_MS;
        attempts.count = 0;
        localStorage.setItem(key, JSON.stringify(attempts));
        return { blocked: true, blockedUntil: attempts.blockedUntil };
      }
      
      localStorage.setItem(key, JSON.stringify(attempts));
      return { 
        blocked: false, 
        remainingAttempts: MAX_ATTEMPTS - attempts.count 
      };
    }
  };

  const clearFailedAttempts = async (emailToClear: string) => {
    try {
      await fetch('/api/login-attempts/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToClear })
      });
    } catch (error) {
      const key = `login_attempts_${emailToClear.toLowerCase()}`;
      localStorage.removeItem(key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) return;
    
    // Check if account is blocked
    if (blockedTime) {
      setErrors({
        general: `This account is temporarily locked due to multiple failed attempts. Please try again in ${countdown}.`
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Attempting login with:', { email, password });

      // Check for admin login
      if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
        console.log('Admin login successful');
        await clearFailedAttempts(email);
        
        const fakeToken = 'admin-jwt-token-' + Date.now();
        const userData = {
          id: '2',
          name: 'Admin User',
          email: email,
          role: 'admin' as const,
          sessionTimeout: null
        };
        login(userData, fakeToken);
        // ✅ No manual navigate – useEffect will redirect when isAuthenticated becomes true
      }
      // Check for regular user login
      else if (email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() && password === DEMO_CREDENTIALS.password) {
        console.log('Regular user login successful');
        await clearFailedAttempts(email);
        
        const fakeToken = 'demo-jwt-token-' + Date.now();
        const userData = {
          id: '1',
          name: 'Marc Eric',
          email: email,
          role: 'user' as const,
          sessionTimeout: 60 * 1000
        };
        login(userData, fakeToken);
        // ✅ No manual navigate – useEffect will redirect when isAuthenticated becomes true
      } else {
        console.log('Login failed - invalid credentials');
        const result = await recordFailedAttempt(email);
        
        if (result?.blocked) {
          setBlockedTime(result.blockedUntil);
          setErrors({
            general: 'Too many failed login attempts. Your account has been temporarily locked for 24 hours. Please try again later or contact support.'
          });
        } else if (result?.remainingAttempts !== undefined) {
          setErrors({
            general: `Invalid email or password. ${result.remainingAttempts} attempt${result.remainingAttempts !== 1 ? 's' : ''} remaining before account lockout.`
          });
        } else {
          // Generic error without specifying which field is incorrect
          setErrors({
            general: 'Invalid login credentials. Please check your email and password and try again.'
          });
        }
        
        // Clear specific field errors since it's a credential mismatch
        setErrors(prev => ({
          ...prev,
          email: undefined,
          password: undefined
        }));
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({
        general: 'Unable to process your request at this time. Please check your internet connection and try again. If the problem persists, contact support.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFieldError = (field: 'email' | 'password') => {
    setErrors(prev => ({
      ...prev,
      [field]: undefined,
      // Clear general error if it exists and we're clearing the field that was the source
      general: prev.general && prev.field === field ? undefined : prev.general,
      field: prev.field === field ? null : prev.field
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <Link to="/" className="auth-logo">
            <img src="/favicon.svg" alt="RadiantMoney" className="logo-icon" />
              <span className="logo-text">RadiantMoney</span>
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
              <div className="testimonial-author"></div>
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

            {errors.general && (
              <div className={`general-error ${blockedTime ? 'locked' : ''}`}>
                {blockedTime && <Clock size={16} />}
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    disabled={isLoading || !!blockedTime}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <span id="email-error" className="error-message">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    disabled={isLoading || !!blockedTime}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={!!blockedTime}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span id="password-error" className="error-message">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading || !!blockedTime}
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
                disabled={isLoading || !!blockedTime}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : blockedTime ? (
                  <>
                    <Clock size={18} aria-hidden="true" />
                    Locked for {countdown}
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-auth">
              <button 
                className="social-btn google" 
                disabled={isLoading || !!blockedTime}
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button 
                className="social-btn apple" 
                disabled={isLoading || !!blockedTime}
                aria-label="Sign in with Apple"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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