import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../context/TransactionContext';
import { ArrowLeft, Shield, Mail, AlertCircle, CheckCircle, Loader, Send, Check } from 'lucide-react';
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

// Format date as "Month Day, Year"
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

// Format number with commas as thousands separators
function formatNumberWithCommas(value: string): string {
    if (!value) return '';
    // Remove existing commas and split into integer and decimal parts
    const [integerPart, decimalPart] = value.replace(/,/g, '').split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

interface FormData {
    fromAccountId: string;
    recipientAccount: string;
    routingNumber: string;
    bankName: string;
    recipientName: string;
    amount: string;          // raw number string without commas
    description: string;
    schedulePayment: boolean;
    scheduleDate: string;
}

interface SecurityData {
    motherMaidenName: string;
    birthYear: string;
}

interface FormErrors {
    fromAccountId?: string;
    recipientAccount?: string;
    routingNumber?: string;
    recipientName?: string;
    amount?: string;
    description?: string;
    scheduleDate?: string;
    motherMaidenName?: string;
    birthYear?: string;
    otp?: string;
    general?: string;
}

interface Notification {
    type: 'success' | 'error' | 'info';
    message: string;
}

// Mock database of routing numbers (9-digit keys) to bank names
const routingNumberDB: Record<string, string> = {
    '011401533': 'Citizens Bank',
    '071000301': 'Chase Bank Illinois',
    '091000019': 'U.S. Bank Minnesota',
    '122000247': 'Wells Fargo California',
    '063100277': 'Truist Bank Florida',
    '075000022': 'PNC Bank Wisconsin',
    '044000037': 'Huntington National Bank',
    '042000314': 'Fifth Third Bank',
    '124003116': 'KeyBank',
    '041000124': 'Regions Bank',
    '065400137': 'Capital One Louisiana',
    '083900363': 'Commerce Bank',
    '107000327': 'FirstBank Colorado',
    '125000024': 'Bank of the West',
    '122105155': 'Union Bank',
    '061000104': 'SunTrust Bank Georgia',
    '031000503': 'M&T Bank',
    '221372865': 'Santander Bank',
    '211370150': 'Eastern Bank',
    '273970116': 'First Horizon Bank',
    '053101121': 'First Citizens Bank',
    '067014822': 'TD Bank Florida',
    '102000021': 'UMB Bank',
    '084106768': 'Arvest Bank',
    '082000549': 'Simmons Bank',
    '111000025': 'Frost Bank',
    '113000023': 'Comerica Bank Texas',
    '114900164': 'Woodforest National Bank',
    '074900783': 'Old National Bank',
    '051404260': 'Atlantic Union Bank',
    '062000019': 'BBVA USA',
    '065402892': 'Whitney Bank',
    '072000326': 'Comerica Bank Michigan',
    '122400724': 'MUFG Union Bank',
    '092900383': 'Banner Bank',
    '121042882': 'Zions Bank California',
    '123103729': 'Umpqua Bank',
    '091215927': 'BMO Harris Bank',
    '075902776': 'Associated Bank',
    '101000187': 'Intrust Bank',
    '061101375': 'Synovus Bank',
    '103100739': 'MidFirst Bank',
    '091300023': 'BancFirst',
    '111900659': 'Prosperity Bank',
    '054001204': 'TowneBank',
    '031201360': 'WSFS Bank',
    '053200983': 'South State Bank',
    '091408501': 'TCF National Bank',
    '051000033': 'United Bank',
    '041202582': 'Park National Bank',
    '123000220': 'Washington Federal',
    '211371555': 'Rockland Trust',
    '067010509': 'City National Bank Florida',
    '111316353': 'Independent Bank Texas',
    '124384933': 'First Interstate Bank',
    '122402133': 'Pacific Western Bank',
    '103112676': 'Bank of Oklahoma',
    '074014213': 'Chemical Bank',
    '211370545': 'Berkshire Bank',
    '221970443': 'Valley National Bank',
    '231372691': 'Fulton Bank',
    '242071758': 'Peoples Bank',
    '083000108': 'Republic Bank',
    '114000093': 'Broadway National Bank',
    '082901120': 'Centennial Bank',
    '113122655': 'Amegy Bank',
    '124003000': 'Glacier Bank',
    '121201694': 'Mechanics Bank',
    '091210046': 'Great Western Bank',
    '041215032': 'First Financial Bank',
    '051409335': 'Sandy Spring Bank',
    '063107513': 'Seacoast National Bank',
    '073900182': 'Central Bank',
    '071102568': 'Wintrust Bank',
    '091311229': 'Security Bank',
    '122105278': 'City National Bank California',
    '062206295': 'Trustmark National Bank',
    '065500752': 'Hancock Whitney Bank',
    '114902528': 'First National Bank Texas',
    '072405545': 'Flagstar Bank',
    '091901683': 'Bank Midwest',
    '075000051': 'Johnson Bank',
    '113111909': 'Texas Capital Bank',
    '031101279': 'Citizens & Northern Bank',
    '122100024': 'California Bank & Trust',
    '053100300': 'First Bank North Carolina',
    '111017694': 'Compass Bank',
    '061120084': 'Colony Bank',
    '082000109': 'First Security Bank',
    '124000737': 'Washington Trust Bank',
    '221571473': 'Provident Bank',
    '242076656': 'Farmers National Bank',
    '044112155': 'First Merchants Bank',
    '063114030': 'BankUnited',
    '051503394': 'Union Bank & Trust',
    '103102616': 'International Bank of Commerce',
};

// Valid OTP codes (user provided)
const validOtps = ['3423232', '8148663', '3898576', '1036033'];

const SendMoney: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { accounts, deductFromAccount } = useAccounts();
    const { addTransaction } = useTransactions();

    const [step, setStep] = useState<'form' | 'security' | 'otp' | 'success'>('form');
    const [formData, setFormData] = useState<FormData>({
        fromAccountId: accounts.length > 0 ? accounts[0].id : '',
        recipientAccount: '',
        routingNumber: '',
        bankName: '',
        recipientName: '',
        amount: '',
        description: '',
        schedulePayment: false,
        scheduleDate: '',
    });
    const [securityData, setSecurityData] = useState<SecurityData>({
        motherMaidenName: '',
        birthYear: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [notification, setNotification] = useState<Notification | null>(null);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpVerifying, setIsOtpVerifying] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [loaderMessage, setLoaderMessage] = useState('Processing, please wait...');
    const [bankLookupTimeout, setBankLookupTimeout] = useState<number | null>(null);

    // For success page timestamps
    const [transferTimestamp] = useState(new Date());
    const [minDeliveryDate] = useState(() => addWorkingDays(new Date(), 7));
    const [maxDeliveryDate] = useState(() => addWorkingDays(new Date(), 14));

    // Handle input changes for main form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'amount') {
            // For amount, we store the raw numeric string (without commas)
            const rawValue = value.replace(/,/g, ''); // remove existing commas
            // Allow only digits and a single decimal point
            const cleaned = rawValue.replace(/[^\d.]/g, '');
            // Prevent multiple decimal points
            const parts = cleaned.split('.');
            const rawNumber = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
            setFormData(prev => ({ ...prev, amount: rawNumber }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

        if (name === 'routingNumber') {
            if (bankLookupTimeout) clearTimeout(bankLookupTimeout);
            const timeout = window.setTimeout(() => {
                const cleanedRouting = value.replace(/\D/g, '');
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

    // Handle input changes for security form
    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSecurityData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Handle OTP input change with auto-verification
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 7);
        setOtp(value);
        if (errors.otp) setErrors({ ...errors, otp: undefined });
        if (notification) setNotification(null);

        // When 7 digits are entered, trigger verification
        if (value.length === 7) {
            handleAutoVerifyOtp(value);
        }
    };

    // Auto-verify OTP when 7 digits are entered
    const handleAutoVerifyOtp = async (otpValue: string) => {
        setIsOtpVerifying(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!validOtps.includes(otpValue)) {
            setErrors({ ...errors, otp: 'Invalid OTP' });
            setIsOtpVerifying(false);
            return;
        }

        // Clear any previous errors
        setErrors({ ...errors, otp: undefined });
        setIsOtpVerifying(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (bankLookupTimeout) clearTimeout(bankLookupTimeout);
        };
    }, [bankLookupTimeout]);

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Validate main form (including balance check for selected account)
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fromAccountId) {
            newErrors.fromAccountId = 'Please select an account';
        }

        if (!formData.recipientAccount.trim()) {
            newErrors.recipientAccount = 'Recipient account number is required';
        } else {
            const cleanedAccount = formData.recipientAccount.replace(/\s/g, '');
            if (!/^\d{10,16}$/.test(cleanedAccount)) {
                newErrors.recipientAccount = 'Account number must be 10 to 16 digits';
            }
        }

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

        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else {
            const amountNum = Number(formData.amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                newErrors.amount = 'Please enter a valid amount greater than 0';
            } else {
                // Check against selected account balance
                const selectedAccount = accounts.find(acc => acc.id === formData.fromAccountId);
                if (selectedAccount && amountNum > selectedAccount.balance) {
                    newErrors.amount = `Insufficient balance. Available: $${selectedAccount.balance.toLocaleString()}`;
                }
            }
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

    // Validate security form – exact match
    const validateSecurity = (): boolean => {
        const newErrors: FormErrors = {};

        if (!securityData.motherMaidenName.trim()) {
            newErrors.motherMaidenName = 'Mother’s maiden name is required';
        } else if (securityData.motherMaidenName.trim().toLowerCase() !== 'grace hoffman'.toLowerCase()) {
            newErrors.motherMaidenName = 'Incorrect mother’s maiden name';
        }

        if (!securityData.birthYear.trim()) {
            newErrors.birthYear = 'Birth year is required';
        } else if (!/^\d{4}$/.test(securityData.birthYear)) {
            newErrors.birthYear = 'Please enter a valid 4-digit year';
        } else if (securityData.birthYear !== '1989') {
            newErrors.birthYear = 'Incorrect birth year';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission -> go to security with multi‑step loading
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setLoaderMessage('Processing please wait...');

        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoaderMessage('Fetching data...');

        await new Promise(resolve => setTimeout(resolve, 1000));

        setStep('security');
        setIsLoading(false);
    };

    // Handle security verification -> go to OTP
    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSecurity()) return;

        setIsLoading(true);
        setLoaderMessage('Verifying security...');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setStep('otp');
        setIsLoading(false);
    };

    // Handle OTP verification, deduct balance, and add transaction
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        // Don't proceed if OTP is not 7 digits or is currently verifying
        if (otp.length !== 7 || isOtpVerifying) {
            if (otp.length !== 7) {
                setErrors({ ...errors, otp: 'Please enter a 7-digit OTP' });
            }
            return;
        }

        // If OTP was already verified as invalid, show error
        if (errors.otp === 'Invalid OTP') {
            return;
        }

        setIsLoading(true);
        setLoaderMessage('Processing transfer...');
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Double-check OTP validity (in case it was auto-verified)
        if (!validOtps.includes(otp)) {
            setErrors({ ...errors, otp: 'Invalid OTP' });
            setIsLoading(false);
            return;
        }

        const amount = Number(formData.amount);
        const success = deductFromAccount(formData.fromAccountId, amount);
        if (!success) {
            setErrors({ ...errors, otp: 'Insufficient balance or account not found' });
            setIsLoading(false);
            return;
        }

        const now = new Date();
        const formattedDate = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
        const newTransaction = {
            id: Date.now().toString(),
            name: `Transfer to ${formData.recipientName}`,
            date: formattedDate,
            amount: amount,
            type: 'debit' as const,
            status: 'pending' as const,
            category: 'Transfer',
            iconName: 'send'
        };
        addTransaction(newTransaction);

        setStep('success');
        setIsLoading(false);
    };

    // Resend OTP with inline notification
    const handleResendOtp = async () => {
        setIsResendingOtp(true);
        setNotification(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show success notification
        setNotification({
            type: 'success',
            message: 'A new OTP has been sent to your email'
        });

        // Clear OTP field for new code
        setOtp('');
        setErrors({ ...errors, otp: undefined });

        setIsResendingOtp(false);
    };

    // Go back
    const handleBack = () => {
        if (step === 'security') {
            setStep('form');
            setSecurityData({ motherMaidenName: '', birthYear: '' });
            setErrors({});
            setNotification(null);
        } else if (step === 'otp') {
            setStep('security');
            setOtp('');
            setIsOtpVerifying(false);
            setErrors({});
            setNotification(null);
        } else if (step === 'success') {
            navigate('/dashboard');
        } else {
            navigate(-1);
        }
    };

    const formatCurrency = (amount: string) => {
        const num = Number(amount);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    const selectedAccount = accounts.find(acc => acc.id === formData.fromAccountId);

    return (
        <div className="send-money-page">
            {isLoading && (
                <div className="global-loader">
                    <div className="loader-content">
                        <Loader size={48} className="spinner" />
                        <p>{loaderMessage}</p>
                    </div>
                </div>
            )}

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
                            <label htmlFor="fromAccountId">From Account</label>
                            <div className="custom-select-wrapper">
                                <select
                                    id="fromAccountId"
                                    name="fromAccountId"
                                    value={formData.fromAccountId}
                                    onChange={handleChange}
                                    className={`custom-select ${errors.fromAccountId ? 'error' : ''}`}
                                    disabled={isLoading}
                                >
                                    <option value="">Select an account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} data-balance={acc.balance} data-name={acc.name}>
                                            {acc.name} (••••{acc.number?.slice(-4) || '0000'}) - ${acc.balance.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                {formData.fromAccountId && (
                                    <div className="selected-display">
                                        {selectedAccount?.name} - ${selectedAccount?.balance.toLocaleString()}
                                    </div>
                                )}
                            </div>
                            {errors.fromAccountId && (
                                <span className="error-message">
                                    <AlertCircle size={14} /> {errors.fromAccountId}
                                </span>
                            )}
                        </div>

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
                                inputMode="numeric"
                                pattern="\d*"
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
                                inputMode="numeric"
                                pattern="\d*"
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
                                    type="text"
                                    id="amount"
                                    name="amount"
                                    value={formatNumberWithCommas(formData.amount)}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    inputMode="decimal"
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
                            Continue
                        </button>
                    </form>
                )}

                {step === 'security' && (
                    <div className="security-container">
                        <div className="security-header">
                            <Shield size={48} className="security-icon" />
                            <h2>Security Verification</h2>
                            <p>Please answer the following security questions</p>
                        </div>

                        <form onSubmit={handleSecuritySubmit} className="security-form">
                            <div className="form-group">
                                <label htmlFor="motherMaidenName">Mother's Maiden Name</label>
                                <input
                                    type="text"
                                    id="motherMaidenName"
                                    name="motherMaidenName"
                                    value={securityData.motherMaidenName}
                                    onChange={handleSecurityChange}
                                    placeholder="Enter mother's maiden name"
                                    className={errors.motherMaidenName ? 'error' : ''}
                                    disabled={isLoading}
                                />
                                {errors.motherMaidenName && (
                                    <span className="error-message">
                                        <AlertCircle size={14} /> {errors.motherMaidenName}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="birthYear">Birth Year</label>
                                <input
                                    type="text"
                                    id="birthYear"
                                    name="birthYear"
                                    value={securityData.birthYear}
                                    onChange={handleSecurityChange}
                                    placeholder="YYYY"
                                    maxLength={4}
                                    inputMode="numeric"
                                    pattern="\d*"
                                    className={errors.birthYear ? 'error' : ''}
                                    disabled={isLoading}
                                />
                                {errors.birthYear && (
                                    <span className="error-message">
                                        <AlertCircle size={14} /> {errors.birthYear}
                                    </span>
                                )}
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                Verify Identity
                            </button>
                        </form>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="otp-container">
                        {notification && (
                            <div className={`notification ${notification.type}`}>
                                {notification.type === 'success' && <Check size={18} />}
                                {notification.type === 'error' && <AlertCircle size={18} />}
                                <span>{notification.message}</span>
                            </div>
                        )}

                        <div className="otp-header">
                            <Mail size={48} className="otp-icon" />
                            <h2>Check your email</h2>
                            <p>We've sent a 7-digit verification code to</p>
                            <p className="user-email">{user?.email || 'your email'}</p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="otp-form">
                            <div className="form-group">
                                <label htmlFor="otp">Enter OTP</label>
                                <div className="otp-input-wrapper">
                                    <input
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={handleOtpChange}
                                        placeholder="0000000"
                                        maxLength={7}
                                        inputMode="numeric"
                                        pattern="\d*"
                                        className={`otp-input ${errors.otp ? 'error' : ''} ${isOtpVerifying ? 'verifying' : ''} ${!errors.otp && otp.length === 7 && !isOtpVerifying && validOtps.includes(otp) ? 'verified' : ''}`}
                                        disabled={isLoading || isOtpVerifying || isResendingOtp}
                                    />
                                    {isOtpVerifying && (
                                        <div className="otp-verifying">
                                            <Loader size={20} className="spinner" />
                                            <span>Verifying...</span>
                                        </div>
                                    )}
                                    {!isOtpVerifying && otp.length === 7 && !errors.otp && validOtps.includes(otp) && (
                                        <div className="otp-verified">
                                            <Check size={20} />
                                            <span>Verified!</span>
                                        </div>
                                    )}
                                </div>
                                {errors.otp && (
                                    <span className="error-message">
                                        <AlertCircle size={14} /> {errors.otp}
                                    </span>
                                )}
                            </div>

                            <div className="otp-actions">
                                <button
                                    type="button"
                                    className={`resend-btn ${isResendingOtp ? 'resending' : ''}`}
                                    onClick={handleResendOtp}
                                    disabled={isLoading || isOtpVerifying || isResendingOtp}
                                >
                                    {isResendingOtp ? (
                                        <>
                                            <Loader size={16} className="spinner" />
                                            <span>Resending...</span>
                                        </>
                                    ) : (
                                        'Resend OTP'
                                    )}
                                </button>
                            </div>

                            <div className="transaction-summary">
                                <h3>Transaction Summary</h3>
                                <div className="summary-item">
                                    <span>From:</span>
                                    <span>{selectedAccount ? `${selectedAccount.name} (${selectedAccount.number})` : ''}</span>
                                </div>
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

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading || isOtpVerifying || isResendingOtp || otp.length !== 7 || errors.otp === 'Invalid OTP'}
                            >
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
                                <span>From:</span>
                                <strong>
                                    {selectedAccount
                                        ? `${selectedAccount.name} (••••${selectedAccount.number?.slice(-4) || '0000'})`
                                        : ''}
                                </strong>
                            </div>
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
                            <div className="detail-item">
                                <span>Transfer Date:</span>
                                <strong>{transferTimestamp.toLocaleString()}</strong>
                            </div>
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