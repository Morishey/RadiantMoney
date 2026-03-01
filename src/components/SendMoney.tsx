import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Shield, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './SendMoney.css';

interface FormData {
  recipientAccount: string;
  recipientName: string;
  amount: string;
  description: string;
}

interface FormErrors {
  recipientAccount?: string;
  recipientName?: string;
  amount?: string;
  description?: string;
  otp?: string;
}

const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [formData, setFormData] = useState<FormData>({
    recipientAccount: '',
    recipientName: '',
    amount: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp] = useState('123456'); // In real app, this would be sent via email

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.recipientAccount.trim()) {
      newErrors.recipientAccount = 'Recipient account number is required';
    } else if (!/^\d{10,16}$/.test(formData.recipientAccount.replace(/\s/g, ''))) {
      newErrors.recipientAccount = 'Account number should be 10-16 digits';
    }
    
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (Number(formData.amount) > 10000) {
      newErrors.amount = 'Maximum transfer amount is $10,000';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (send OTP)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    // Simulate API call to send OTP to user's email
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('otp');
    } catch (error) {
      setErrors({ ...errors, otp: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ ...errors, otp: 'OTP is required' });
      return;
    }
    if (otp !== generatedOtp) {
      setErrors({ ...errors, otp: 'Invalid OTP' });
      return;
    }
    
    setIsLoading(true);
    // Simulate transfer processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
    } catch (error) {
      setErrors({ ...errors, otp: 'Transfer failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show toast or alert (in real app, resend email)
      alert('OTP resent to your email');
    } finally {
      setIsLoading(false);
    }
  };

  // Go back
  const handleBack = () => {
    if (step === 'otp') {
      setStep('form');
      setOtp('');
      setErrors({});
    } else if (step === 'success') {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  // Format amount as currency
  const formatCurrency = (amount: string) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <div className="send-money-page">
      <header className="send-money-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>Send Money</h1>
        <div className="header-placeholder"></div>
      </header>

      <div className="send-money-container">
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="send-money-form">
            <div className="form-group">
              <label htmlFor="recipientAccount">Recipient Account Number</label>
              <input
                type="text"
                id="recipientAccount"
                name="recipientAccount"
                value={formData.recipientAccount}
                onChange={handleChange}
                placeholder="Enter account number"
                className={errors.recipientAccount ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.recipientAccount && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.recipientAccount}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={errors.recipientName ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.recipientName && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.recipientName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className={errors.amount ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.amount && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.amount}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What's this for?"
                rows={3}
                className={errors.description ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.description && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.description}
                </span>
              )}
            </div>

            <div className="security-note">
              <Shield size={16} />
              <span>Secure transaction protected by 256-bit encryption</span>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Continue with OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <div className="otp-container">
            <div className="otp-header">
              <Mail size={48} className="otp-icon" />
              <h2>Check your email</h2>
              <p>We've sent a 6-digit verification code to</p>
              <p className="user-email">{user?.email || 'your email'}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="otp-form">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (errors.otp) setErrors({ ...errors, otp: undefined });
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className={errors.otp ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.otp && (
                  <span className="error-message">
                    <AlertCircle size={14} /> {errors.otp}
                  </span>
                )}
              </div>

              <div className="otp-actions">
                <button type="button" className="resend-btn" onClick={handleResendOtp} disabled={isLoading}>
                  Resend OTP
                </button>
              </div>

              <div className="transaction-summary">
                <h3>Transaction Summary</h3>
                <div className="summary-item">
                  <span>To:</span>
                  <span>{formData.recipientName}</span>
                </div>
                <div className="summary-item">
                  <span>Account:</span>
                  <span>{formData.recipientAccount}</span>
                </div>
                <div className="summary-item">
                  <span>Amount:</span>
                  <span className="amount">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="summary-item">
                  <span>Description:</span>
                  <span>{formData.description}</span>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Verify & Send'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="success-container">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Transfer Successful!</h2>
            <p>Your money has been sent successfully.</p>
            <div className="success-details">
              <div className="detail-item">
                <span>Amount:</span>
                <strong>{formatCurrency(formData.amount)}</strong>
              </div>
              <div className="detail-item">
                <span>To:</span>
                <strong>{formData.recipientName}</strong>
              </div>
              <div className="detail-item">
                <span>Account:</span>
                <strong>{formData.recipientAccount}</strong>
              </div>
              <div className="detail-item">
                <span>Reference:</span>
                <strong>TXN{Math.floor(Math.random() * 1000000)}</strong>
              </div>
            </div>
            <button className="done-btn" onClick={() => navigate('/dashboard')}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoney;