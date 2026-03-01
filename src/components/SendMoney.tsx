import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Shield, Mail, Lock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import './SendMoney.css';

// Helper to add working days (Mon-Fri) to a date
function addWorkingDays(startDate: Date, days: number): Date {
  let result = new Date(startDate);
  let addedDays = 0;
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Skip Saturday (6) and Sunday (0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  return result;
}

// Format date as "Month Day, Year" (e.g., "March 15, 2026")
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface FormData {
  recipientAccount: string;
  routingNumber: string;
  bankName: string;
  recipientName: string;
  amount: string;
  description: string;
  schedulePayment: boolean;
  scheduleDate: string;
}

interface FormErrors {
  recipientAccount?: string;
  routingNumber?: string;
  recipientName?: string;
  amount?: string;
  description?: string;
  otp?: string;
  scheduleDate?: string;
}

// Mock database of routing numbers (9-digit keys) to bank names
const routingNumberDB: Record<string, string> = {
  '021000021': 'JPMorgan Chase',
  '026009593': 'Bank of America',
  '121000358': 'Wells Fargo',
  '031100209': 'Citibank',
  '011000138': 'TD Bank',
  '031101169': 'PNC Bank',
  '021200025': 'US Bank',
  '051000017': 'Truist',
  '056007736': 'Capital One',
  '021000322': 'HSBC',
};

const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [formData, setFormData] = useState<FormData>({
    recipientAccount: '',
    routingNumber: '',
    bankName: '',
    recipientName: '',
    amount: '',
    description: '',
    schedulePayment: false,
    scheduleDate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp] = useState('123456'); // In real app, this would be sent via email
  const [bankLookupTimeout, setBankLookupTimeout] = useState<number | null>(null);
  
  // For success page timestamps
  const [transferTimestamp] = useState(new Date()); // capture time of transfer
  const [minDeliveryDate] = useState(() => addWorkingDays(new Date(), 7));
  const [maxDeliveryDate] = useState(() => addWorkingDays(new Date(), 14));

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Special handling for routing number: look up bank name
    if (name === 'routingNumber') {
      // Clear previous timeout
      if (bankLookupTimeout) clearTimeout(bankLookupTimeout);
      
      // Set timeout to look up bank name after user stops typing
      const timeout = window.setTimeout(() => {
        const cleanedRouting = value.replace(/\D/g, '');
        // Only lookup when we have exactly 9 digits
        if (cleanedRouting.length === 9) {
          const bankName = routingNumberDB[cleanedRouting] || 'Unknown Bank';
          setFormData(prev => ({ ...prev, bankName }));
        } else {
          setFormData(prev => ({ ...prev, bankName: '' }));
        }
      }, 500);
      setBankLookupTimeout(timeout);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (bankLookupTimeout) clearTimeout(bankLookupTimeout);
    };
  }, [bankLookupTimeout]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Account number: 10-16 digits
    if (!formData.recipientAccount.trim()) {
      newErrors.recipientAccount = 'Recipient account number is required';
    } else {
      const cleanedAccount = formData.recipientAccount.replace(/\s/g, '');
      if (!/^\d{10,16}$/.test(cleanedAccount)) {
        newErrors.recipientAccount = 'Account number must be 10 to 16 digits';
      }
    }
    
    // Routing number: exactly 9 digits
    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = 'Routing number is required';
    } else {
      const cleanedRouting = formData.routingNumber.replace(/\s/g, '');
      if (!/^\d{9}$/.test(cleanedRouting)) {
        newErrors.routingNumber = 'Routing number must be exactly 9 digits';
      }
    }
    
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }
    
    // Amount: any positive number (no upper limit)
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (formData.schedulePayment) {
      if (!formData.scheduleDate) {
        newErrors.scheduleDate = 'Please select a date for scheduled payment';
      } else {
        const selectedDate = new Date(formData.scheduleDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.scheduleDate = 'Scheduled date cannot be in the past';
        }
      }
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
                placeholder="10 to 16 digits"
                maxLength={16}
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
              <label htmlFor="routingNumber">Routing Number</label>
              <input
                type="text"
                id="routingNumber"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                placeholder="9-digit routing number"
                maxLength={9}
                className={errors.routingNumber ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.routingNumber && (
                <span className="error-message">
                  <AlertCircle size={14} /> {errors.routingNumber}
                </span>
              )}
              {formData.bankName && (
                <span className="bank-name-hint">Bank: {formData.bankName}</span>
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

            <div className="form-group schedule-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="schedulePayment"
                  checked={formData.schedulePayment}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span>Schedule this payment</span>
              </label>
            </div>

            {formData.schedulePayment && (
              <div className="form-group">
                <label htmlFor="scheduleDate">Select Date</label>
                <input
                  type="date"
                  id="scheduleDate"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.scheduleDate ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.scheduleDate && (
                  <span className="error-message">
                    <AlertCircle size={14} /> {errors.scheduleDate}
                  </span>
                )}
              </div>
            )}

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
                  <span>Routing:</span>
                  <span>{formData.routingNumber} ({formData.bankName || 'Unknown'})</span>
                </div>
                <div className="summary-item">
                  <span>Amount:</span>
                  <span className="amount">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="summary-item">
                  <span>Description:</span>
                  <span>{formData.description}</span>
                </div>
                {formData.schedulePayment && (
                  <div className="summary-item">
                    <span>Scheduled:</span>
                    <span>{new Date(formData.scheduleDate).toLocaleDateString()}</span>
                  </div>
                )}
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
            <h2>{formData.schedulePayment ? 'Payment Scheduled!' : 'Transfer Successful!'}</h2>
            <p>{formData.schedulePayment ? 'Your payment has been scheduled.' : 'Your money has been sent successfully.'}</p>
            
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
              {formData.schedulePayment && (
                <div className="detail-item">
                  <span>Scheduled Date:</span>
                  <strong>{new Date(formData.scheduleDate).toLocaleDateString()}</strong>
                </div>
              )}
              {/* Transfer date/time */}
              <div className="detail-item">
                <span>Transfer Date:</span>
                <strong>{transferTimestamp.toLocaleString()}</strong>
              </div>
              {/* Expected delivery range */}
              <div className="detail-item">
                <span>Est. Delivery:</span>
                <strong>{formatDate(minDeliveryDate)} – {formatDate(maxDeliveryDate)}</strong>
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