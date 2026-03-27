import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountContext';
import { useTransactions } from '../context/TransactionContext';
import { ArrowLeft, Shield, Mail, AlertCircle, CheckCircle, Loader, Check, Download, Printer } from 'lucide-react';
import './SendMoney.css';

// ---------- Helper functions ----------
function addWorkingDays(startDate: Date, days: number): Date {
    let result = new Date(startDate);
    let addedDays = 0;
    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0 && result.getDay() !== 6) addedDays++;
    }
    return result;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatNumberWithCommas(value: string): string {
    if (!value) return '';
    const [integerPart, decimalPart] = value.replace(/,/g, '').split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
// ---------- End helpers ----------

// ---------- Interfaces ----------
interface TransferFormData {
    fromAccountId: string;
    transferType: 'external' | 'internal';
    // External fields
    recipientAccount?: string;
    sortCode?: string;
    bankName?: string;
    recipientName?: string;
    // Internal fields
    toAccountId?: string;
    // Common
    email: string;
    amount: string;
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
    transferType?: string;
    recipientAccount?: string;
    sortCode?: string;
    recipientName?: string;
    toAccountId?: string;
    email?: string;
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
// ---------- End interfaces ----------

// UK sort code to bank name mapping (6 digits with hyphens)
const sortCodeDB: Record<string, string> = {
    '20-00-00': 'Barclays',
    '40-00-00': 'HSBC UK',
    '30-00-00': 'Lloyds Bank',
    '60-00-00': 'NatWest',
    '09-00-00': 'Santander UK',
    '83-00-00': 'Royal Bank of Scotland',
    '80-00-00': 'Bank of Scotland',
    '11-00-00': 'Halifax',
    '07-00-00': 'Nationwide Building Society',
    '77-00-00': 'TSB Bank',
    '08-00-00': 'Co-operative Bank',
    '23-00-00': 'Metro Bank',
    '04-00-00': 'Monzo',
    '82-00-00': 'Virgin Money',
    '05-00-00': 'Yorkshire Bank',
    '93-00-00': 'AIB (NI)',
    '95-00-00': 'Danske Bank (NI)',
    '98-00-00': 'Ulster Bank',
    '40-12-34': 'First Direct',
    '40-56-78': 'M&S Bank',
    '40-90-12': 'Tesco Bank',
    '40-99-88': "Sainsbury's Bank",
    '16-00-00': 'Triodos Bank',
    '01-00-00': 'Bank of Ireland (UK)',
    '02-00-00': 'Allied Irish Bank (GB)',
    '03-00-00': 'Coutts & Co',
    '06-00-00': 'Cater Allen',
    '22-00-00': 'Handelsbanken'
};

// Format sort code as XX-XX-XX while typing
function formatSortCode(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    const parts = [];
    for (let i = 0; i < digits.length; i += 2) {
        parts.push(digits.slice(i, i + 2));
    }
    return parts.join('-');
}

// ---------- OTP Section ----------
const validOtps = ['3423232', '8148663', '3898576', '1036033', '5289473', '7612345', '4901827', '6354912', '8745632', '2190876',
    '8148663',
    '3898576',
    '1036033',
    '5289473',
    '7612345',
    '4901827',
    '6354912',
    '8745632',
    '2190876',
    '4567891',
    '9234501',
    '3678902',
    '5812349',
    '7901234',
    '3456789',
    '9023456',
    '1789456',
    '6345789',
    '8123467'];

function getRandomOTP(): string {
    const randomIndex = Math.floor(Math.random() * validOtps.length);
    return validOtps[randomIndex];
}

function generateOTPEmailHTML(
    userName: string,
    transactionType: string,
    currency: string,
    amount: string,
    recipientInfo: string,
    otpCode: string,
    expiryMinutes: number,
    datetime: string
): string {
    const formattedAmount = `${currency} ${amount}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>OTP Verification - RadiantMoney</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #eef2f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px 0;
        }
        .email-container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
        .header {
            background: linear-gradient(135deg, #0a2b3e 0%, #1a4a6f 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header h2 {
            font-size: 22px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.3px;
            margin-bottom: 4px;
        }
        .header p {
            font-size: 13px;
            color: rgba(255,255,255,0.8);
            margin-top: 4px;
        }
        .content {
            padding: 32px 28px;
        }
        .greeting {
            font-size: 16px;
            color: #1e293b;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        .greeting strong {
            color: #0a2b3e;
        }
        .instruction {
            font-size: 14px;
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .details {
            background: #f8fafc;
            border-radius: 20px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #64748b;
            font-weight: 500;
        }
        .detail-value {
            color: #0a2b3e;
            font-weight: 600;
        }
        .otp-box {
            background: #fefce8;
            border-radius: 20px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
            border: 1px solid #fde047;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #b45309;
            margin-bottom: 12px;
        }
        .otp-code {
            font-family: 'Courier New', monospace;
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0a2b3e;
            background: white;
            padding: 16px 20px;
            border-radius: 16px;
            display: inline-block;
            border: 1px solid #e2e8f0;
            margin: 8px 0;
        }
        .expiry {
            font-size: 13px;
            color: #d97706;
            margin-top: 12px;
        }
        .warning {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 14px 16px;
            border-radius: 12px;
            font-size: 13px;
            color: #7f1a1a;
            margin: 24px 0;
        }
        .warning strong {
            display: block;
            margin-bottom: 6px;
        }
        .footer {
            background: #f8fafc;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
        }
        .footer p {
            margin: 4px 0;
        }
        @media (max-width: 600px) {
            .content { padding: 24px 20px; }
            .otp-code { font-size: 32px; letter-spacing: 6px; padding: 12px 16px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>🏦 RadiantMoney Bank</h2>
            <p>Secure Transaction OTP</p>
        </div>
        <div class="content">
            <div class="greeting">
                Hello, <strong>${escapeHtml(userName)}</strong>,
            </div>
            <div class="instruction">
                You have requested to perform a secure transaction. Please use the verification code below to complete your transfer.
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Transaction Type</span>
                    <span class="detail-value">${escapeHtml(transactionType)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">${escapeHtml(formattedAmount)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Recipient</span>
                    <span class="detail-value">${escapeHtml(recipientInfo)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${escapeHtml(datetime)}</span>
                </div>
            </div>

            <div class="otp-box">
                <div class="otp-label">🔑 Verification Code</div>
                <div class="otp-code">${escapeHtml(otpCode)}</div>
                <div class="expiry">⏰ This code will expire in ${escapeHtml(expiryMinutes.toString())} minutes</div>
            </div>

            <div class="warning">
                <strong>⚠️ Security Alert</strong>
                RadiantMoney Bank will NEVER ask for this code by phone, text, or email. If someone requests it, it's a scam. Report immediately.
            </div>
        </div>
        <div class="footer">
            <p>© 2026 RadiantMoney Bank. All rights reserved.</p>
            <p>This is an automated message – please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
}

function generateTransferConfirmationEmailHTML(
    recipientName: string,
    amount: string,
    transferType: string,
    fromAccountName: string,
    toAccountInfo: string,
    transactionReference: string,
    datetime: string
): string {
    const formattedAmount = `£${amount}`;
    const isExternal = transferType === 'external';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>Transfer Confirmation - RadiantMoney</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #eef2f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px 0;
        }
        .email-container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
        .header {
            background: linear-gradient(135deg, #0a2b3e 0%, #1a4a6f 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header h2 {
            font-size: 22px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.3px;
            margin-bottom: 4px;
        }
        .header p {
            font-size: 13px;
            color: rgba(255,255,255,0.8);
            margin-top: 4px;
        }
        .content {
            padding: 32px 28px;
        }
        .greeting {
            font-size: 16px;
            color: #1e293b;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        .greeting strong {
            color: #0a2b3e;
        }
        .instruction {
            font-size: 14px;
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .details {
            background: #f8fafc;
            border-radius: 20px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #64748b;
            font-weight: 500;
        }
        .detail-value {
            color: #0a2b3e;
            font-weight: 600;
        }
        .amount-highlight {
            font-size: 18px;
            font-weight: 700;
            color: #0a2b3e;
        }
        .footer {
            background: #f8fafc;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #94a3b8;
        }
        .footer p {
            margin: 4px 0;
        }
        .thankyou {
            text-align: center;
            margin-top: 20px;
            font-size: 13px;
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>🏦 RadiantMoney Bank</h2>
            <p>Transfer Confirmation</p>
        </div>
        <div class="content">
            <div class="greeting">
                Hello <strong>${escapeHtml(recipientName)}</strong>,
            </div>
            <div class="instruction">
                Your ${isExternal ? 'external transfer' : 'internal transfer'} has been completed successfully.
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Transaction Reference</span>
                    <span class="detail-value">${escapeHtml(transactionReference)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${escapeHtml(datetime)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">From Account</span>
                    <span class="detail-value">${escapeHtml(fromAccountName)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">To</span>
                    <span class="detail-value">${escapeHtml(toAccountInfo)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value amount-highlight">${escapeHtml(formattedAmount)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value" style="color: #10b981;">Completed</span>
                </div>
            </div>

            <div class="thankyou">
                <p>Thank you for banking with RadiantMoney.<br>Your funds have been transferred securely.</p>
            </div>
        </div>
        <div class="footer">
            <p>© 2026 RadiantMoney Bank. All rights reserved.</p>
            <p>This is an automated message – please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
}

async function sendOTPEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    otpCode?: string;
    amount?: string;
    recipient?: string;
}): Promise<boolean> {
    try {
        const response = await fetch('/api/send-otp-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData),
        });
        if (!response.ok) throw new Error('Failed to send email');
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}
// ---------- End OTP Section ----------

const SendMoney: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { accounts: rawAccounts, deductFromAccount, updateAccountBalance } = useAccounts();
    const { addTransaction } = useTransactions();

    // Filter out checking accounts
    const accounts = rawAccounts.filter(acc => acc.type !== 'checking');

    const [step, setStep] = useState<'form' | 'security' | 'otp' | 'success'>('form');
    const [formData, setFormData] = useState<TransferFormData>({
        fromAccountId: accounts.length > 0 ? accounts[0].id : '',
        transferType: 'external',
        recipientAccount: '',
        sortCode: '',
        bankName: '',
        recipientName: '',
        toAccountId: accounts.length > 1 ? accounts[1].id : '',
        email: user?.email || '',
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
    const [generatedOtp, setGeneratedOtp] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpVerifying, setIsOtpVerifying] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [loaderMessage, setLoaderMessage] = useState('Processing, please wait...');
    const [bankLookupTimeout, setBankLookupTimeout] = useState<number | null>(null);
    const [transactionReference, setTransactionReference] = useState<string>('');

    const [transferTimestamp] = useState(new Date());

    // ---------- Event Handlers ----------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'amount') {
            const rawValue = value.replace(/,/g, '');
            const cleaned = rawValue.replace(/[^\d.]/g, '');
            const parts = cleaned.split('.');
            const rawNumber = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
            setFormData(prev => ({ ...prev, amount: rawNumber }));
        } else if (name === 'sortCode') {
            const formatted = formatSortCode(value);
            setFormData(prev => ({ ...prev, sortCode: formatted, bankName: '' }));
            if (bankLookupTimeout) clearTimeout(bankLookupTimeout);
            const timeout = window.setTimeout(() => {
                const cleaned = formatted.replace(/\D/g, '');
                if (cleaned.length === 6) {
                    const formattedKey = `${cleaned.slice(0,2)}-${cleaned.slice(2,4)}-${cleaned.slice(4,6)}`;
                    const bank = sortCodeDB[formattedKey] || 'Unknown Bank';
                    setFormData(prev => ({ ...prev, bankName: bank }));
                } else {
                    setFormData(prev => ({ ...prev, bankName: '' }));
                }
            }, 500);
            setBankLookupTimeout(timeout);
        } else if (name === 'transferType') {
            setFormData(prev => ({ ...prev, transferType: value as 'external' | 'internal' }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSecurityData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 7);
        setOtp(value);
        if (errors.otp) setErrors({ ...errors, otp: undefined });
        if (notification) setNotification(null);

        if (value.length === 7) {
            handleAutoVerifyOtp(value);
        }
    };

    const handleAutoVerifyOtp = async (otpValue: string) => {
        setIsOtpVerifying(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (otpValue !== generatedOtp) {
            setErrors({ ...errors, otp: 'Invalid OTP' });
        } else {
            setErrors({ ...errors, otp: undefined });
        }
        setIsOtpVerifying(false);
    };

    // ---------- Validation ----------
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.fromAccountId) newErrors.fromAccountId = 'Please select an account';

        if (formData.transferType === 'external') {
            // External validation
            if (!formData.recipientAccount?.trim()) {
                newErrors.recipientAccount = 'Recipient account number is required';
            } else {
                const cleanedAccount = formData.recipientAccount.replace(/\s/g, '');
                if (!/^\d{6,8}$/.test(cleanedAccount)) {
                    newErrors.recipientAccount = 'Account number must be 6 to 8 digits';
                }
            }
            if (!formData.sortCode?.trim()) {
                newErrors.sortCode = 'Sort code is required';
            } else {
                const cleaned = formData.sortCode.replace(/\D/g, '');
                if (cleaned.length !== 6) {
                    newErrors.sortCode = 'Sort code must be 6 digits';
                }
            }
            if (!formData.recipientName?.trim()) newErrors.recipientName = 'Recipient name is required';
        } else {
            // Internal validation
            if (!formData.toAccountId) {
                newErrors.toAccountId = 'Please select a destination account';
            } else if (formData.toAccountId === formData.fromAccountId) {
                newErrors.toAccountId = 'Cannot transfer to the same account';
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else {
            const amountNum = Number(formData.amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                newErrors.amount = 'Please enter a valid amount greater than 0';
            } else {
                const selectedAccount = accounts.find(acc => acc.id === formData.fromAccountId);
                if (selectedAccount && amountNum > selectedAccount.balance) {
                    newErrors.amount = `Insufficient balance. Available: £${selectedAccount.balance.toLocaleString()}`;
                }
            }
        }

        // Description is required only for external transfers
        if (formData.transferType === 'external') {
            if (!formData.description.trim()) {
                newErrors.description = 'Description is required';
            } else if (formData.description.length < 3) {
                newErrors.description = 'Description must be at least 3 characters';
            }
        }

        if (formData.schedulePayment && formData.transferType === 'external') {
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
        } else if (securityData.birthYear !== '1981') {
            newErrors.birthYear = 'Incorrect birth year';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getFormattedDateTime = (): string => {
        const now = new Date();
        return now.toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // ---------- Step Handlers ----------
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setLoaderMessage('Processing, please wait...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        const newOtp = getRandomOTP();
        setGeneratedOtp(newOtp);

        // Build recipient info for email
        let recipientInfo = '';
        if (formData.transferType === 'external') {
            recipientInfo = `${formData.recipientName} (${formData.recipientAccount})`;
        } else {
            const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
            recipientInfo = `${toAccount?.name} (${toAccount?.number})`;
        }

        const emailHtml = generateOTPEmailHTML(
            formData.recipientName || (accounts.find(acc => acc.id === formData.toAccountId)?.name || 'my own account'),
            formData.transferType === 'external' ? 'External Transfer' : 'Internal Transfer',
            '£',
            formData.amount,
            recipientInfo,
            newOtp,
            10,
            getFormattedDateTime()
        );

        const emailSent = await sendOTPEmail({
            to: formData.email,
            subject: `RadiantMoney Bank - OTP for £${formData.amount} ${formData.transferType === 'external' ? 'transfer' : 'internal transfer'}`,
            html: emailHtml,
            otpCode: newOtp,
            amount: formData.amount,
            recipient: formData.transferType === 'external' ? formData.recipientName! : 'my own account',
        });

        if (emailSent) {
            setNotification({ type: 'success', message: `Verification code sent to ${formData.email}` });
            // For internal transfers, go directly to OTP; otherwise go to security questions
            if (formData.transferType === 'internal') {
                setStep('otp');
            } else {
                setStep('security');
            }
        } else {
            setErrors({ ...errors, general: 'Failed to send verification code. Please try again.' });
        }
        setIsLoading(false);
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSecurity()) return;

        setIsLoading(true);
        setLoaderMessage('Verifying security...');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setStep('otp');
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 7) {
            setErrors({ ...errors, otp: 'Please enter a 7-digit verification code' });
            return;
        }
        if (otp !== generatedOtp) {
            setErrors({ ...errors, otp: 'Invalid verification code' });
            return;
        }

        setIsLoading(true);
        setLoaderMessage('Processing transfer...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        const amountNum = Number(formData.amount);
        // Deduct from source
        const success = deductFromAccount(formData.fromAccountId, amountNum);
        if (!success) {
            setErrors({ ...errors, otp: 'Insufficient balance or account not found' });
            setIsLoading(false);
            return;
        }

        // If internal transfer, add to destination
        if (formData.transferType === 'internal' && formData.toAccountId) {
            const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
            if (toAccount) {
                updateAccountBalance(formData.toAccountId, toAccount.balance + amountNum);
            }
        }

        // Generate transaction reference
        const ref = `TRF${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        setTransactionReference(ref);

        const now = new Date();
        const formattedDate = now.toLocaleString('en-GB', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
        const newTransaction = {
            id: Date.now().toString(),
            name: formData.transferType === 'external' 
                ? `Transfer to ${formData.recipientName}` 
                : `Transfer to ${accounts.find(acc => acc.id === formData.toAccountId)?.name}`,
            date: formattedDate,
            amount: amountNum,
            type: 'debit' as const,
            status: 'completed' as const,
            category: formData.transferType === 'external' ? 'Transfer' : 'Internal Transfer',
            iconName: formData.transferType === 'external' ? 'send' : 'repeat',
            reference: ref,
        };
        addTransaction(newTransaction);

        // Send confirmation email
        const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
        const toAccountInfo = formData.transferType === 'external'
            ? `${formData.recipientName} (${formData.recipientAccount})`
            : `${accounts.find(acc => acc.id === formData.toAccountId)?.name} (${accounts.find(acc => acc.id === formData.toAccountId)?.number})`;

        const confirmationHtml = generateTransferConfirmationEmailHTML(
            formData.recipientName || fromAccount?.name || 'Customer',
            formData.amount,
            formData.transferType,
            fromAccount?.name || 'Unknown Account',
            toAccountInfo,
            ref,
            getFormattedDateTime()
        );

        // Send confirmation email in the background; don't wait for it to complete
        sendOTPEmail({
            to: formData.email,
            subject: `Transfer Confirmation - £${formData.amount} ${formData.transferType === 'external' ? 'transfer' : 'internal transfer'}`,
            html: confirmationHtml,
        }).catch(err => console.error('Confirmation email failed:', err));

        setStep('success');
        setIsLoading(false);
    };

    const handleResendOtp = async () => {
        setIsResendingOtp(true);
        const newOtp = getRandomOTP();
        setGeneratedOtp(newOtp);

        let recipientInfo = '';
        if (formData.transferType === 'external') {
            recipientInfo = `${formData.recipientName} (${formData.recipientAccount})`;
        } else {
            const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
            recipientInfo = `${toAccount?.name} (${toAccount?.number})`;
        }

        const emailHtml = generateOTPEmailHTML(
            formData.recipientName || (accounts.find(acc => acc.id === formData.toAccountId)?.name || 'my own account'),
            formData.transferType === 'external' ? 'External Transfer' : 'Internal Transfer',
            '£',
            formData.amount,
            recipientInfo,
            newOtp,
            10,
            getFormattedDateTime()
        );

        await sendOTPEmail({
            to: formData.email,
            subject: `RadiantMoney Bank - New verification code for £${formData.amount} transfer`,
            html: emailHtml,
            otpCode: newOtp,
            amount: formData.amount,
            recipient: formData.transferType === 'external' ? formData.recipientName! : 'my own account',
        });

        setNotification({ type: 'success', message: `New verification code sent to ${formData.email}` });
        setOtp('');
        setErrors({ ...errors, otp: undefined });
        setIsResendingOtp(false);
    };

    const handleBack = () => {
        if (step === 'security') {
            setStep('form');
            setSecurityData({ motherMaidenName: '', birthYear: '' });
            setErrors({});
        } else if (step === 'otp') {
            setStep('security');
            setOtp('');
            setErrors({});
        } else if (step === 'success') {
            navigate('/dashboard');
        } else {
            navigate(-1);
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleDownloadReceipt = () => {
        const receiptContent = document.getElementById('receipt-content');
        if (receiptContent) {
            const htmlContent = receiptContent.innerHTML;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Transaction Receipt - RadiantMoney Bank</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                                .receipt-header { text-align: center; margin-bottom: 30px; }
                                .receipt-details { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
                                .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
                                .thankyou { text-align: center; margin-top: 30px; color: #666; }
                            </style>
                        </head>
                        <body>
                            ${htmlContent}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    // ---------- Helpers ----------
    const selectedAccount = accounts.find(acc => acc.id === formData.fromAccountId);
    const formatCurrency = (amount: string) => `£${Number(amount).toLocaleString()}`;

    // ---------- JSX ----------
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
                        {/* Transfer Type Toggle */}
                        <div className="form-group">
                            <label>Transfer Type</label>
                            <div className="transfer-type-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="transferType"
                                        value="external"
                                        checked={formData.transferType === 'external'}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <span>External Transfer</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="transferType"
                                        value="internal"
                                        checked={formData.transferType === 'internal'}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <span>Transfer between my accounts</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>From Account</label>
                            <select
                                name="fromAccountId"
                                value={formData.fromAccountId}
                                onChange={handleChange}
                                className={errors.fromAccountId ? 'error' : ''}
                                disabled={isLoading}
                            >
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} (••••{acc.number?.slice(-4)}) - £{acc.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                            {errors.fromAccountId && <span className="error-message"><AlertCircle size={14} /> {errors.fromAccountId}</span>}
                        </div>

                        {formData.transferType === 'external' ? (
                            <>
                                <div className="form-group">
                                    <label>Recipient Account Number</label>
                                    <input
                                        type="text"
                                        name="recipientAccount"
                                        value={formData.recipientAccount}
                                        onChange={handleChange}
                                        placeholder="6 to 8 digits"
                                        maxLength={8}
                                        className={errors.recipientAccount ? 'error' : ''}
                                        disabled={isLoading}
                                    />
                                    {errors.recipientAccount && <span className="error-message"><AlertCircle size={14} /> {errors.recipientAccount}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Sort Code</label>
                                    <input
                                        type="text"
                                        name="sortCode"
                                        value={formData.sortCode}
                                        onChange={handleChange}
                                        placeholder="XX-XX-XX (e.g., 20-00-00)"
                                        maxLength={8}
                                        className={errors.sortCode ? 'error' : ''}
                                        disabled={isLoading}
                                    />
                                    {errors.sortCode && <span className="error-message"><AlertCircle size={14} /> {errors.sortCode}</span>}
                                    {formData.bankName && <span className="bank-name-hint">{formData.bankName}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Recipient Name</label>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className={errors.recipientName ? 'error' : ''}
                                        disabled={isLoading}
                                    />
                                    {errors.recipientName && <span className="error-message"><AlertCircle size={14} /> {errors.recipientName}</span>}
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label>To Account</label>
                                <select
                                    name="toAccountId"
                                    value={formData.toAccountId}
                                    onChange={handleChange}
                                    className={errors.toAccountId ? 'error' : ''}
                                    disabled={isLoading}
                                >
                                    {accounts.filter(acc => acc.id !== formData.fromAccountId).map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} (••••{acc.number?.slice(-4)}) - £{acc.balance.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                {errors.toAccountId && <span className="error-message"><AlertCircle size={14} /> {errors.toAccountId}</span>}
                            </div>
                        )}

                        {/* Amount field – placed after "From Account" and "To Account" for internal transfers,
                            after recipient details for external transfers */}
                        <div className="form-group">
                            <label>Amount</label>
                            <div className="amount-input-wrapper">
                                <span className="currency-symbol">£</span>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formatNumberWithCommas(formData.amount)}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={errors.amount ? 'error' : ''}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.amount && <span className="error-message"><AlertCircle size={14} /> {errors.amount}</span>}
                        </div>

                        {formData.transferType === 'external' && (
                            <>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="What's this for?"
                                        rows={2}
                                        className={`description-textarea ${errors.description ? 'error' : ''}`}
                                        disabled={isLoading}
                                    />
                                    {errors.description && <span className="error-message"><AlertCircle size={14} /> {errors.description}</span>}
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
                                        <label>Select Date</label>
                                        <input
                                            type="date"
                                            name="scheduleDate"
                                            value={formData.scheduleDate}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={errors.scheduleDate ? 'error' : ''}
                                            disabled={isLoading}
                                        />
                                        {errors.scheduleDate && <span className="error-message"><AlertCircle size={14} /> {errors.scheduleDate}</span>}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="form-group">
                            <label>Email for Verification</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your-email@example.com"
                                className={errors.email ? 'error' : ''}
                                disabled={isLoading}
                            />
                            {errors.email && <span className="error-message"><AlertCircle size={14} /> {errors.email}</span>}
                            <small className="field-hint">We'll send the verification code to this email</small>
                        </div>

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
                                <label>Mother's Maiden Name</label>
                                <input
                                    type="text"
                                    name="motherMaidenName"
                                    value={securityData.motherMaidenName}
                                    onChange={handleSecurityChange}
                                    placeholder="Enter mother's maiden name"
                                    className={errors.motherMaidenName ? 'error' : ''}
                                    disabled={isLoading}
                                />
                                {errors.motherMaidenName && <span className="error-message"><AlertCircle size={14} /> {errors.motherMaidenName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Birth Year</label>
                                <input
                                    type="text"
                                    name="birthYear"
                                    value={securityData.birthYear}
                                    onChange={handleSecurityChange}
                                    placeholder="YYYY"
                                    maxLength={4}
                                    className={errors.birthYear ? 'error' : ''}
                                    disabled={isLoading}
                                />
                                {errors.birthYear && <span className="error-message"><AlertCircle size={14} /> {errors.birthYear}</span>}
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
                                <span>{notification.message}</span>
                            </div>
                        )}
                        <div className="otp-header">
                            <Mail size={48} className="otp-icon" />
                            <h2>Check your email</h2>
                            <p>We've sent a 7-digit verification code to</p>
                            <p className="user-email">{formData.email}</p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="otp-form">
                            <div className="form-group">
                                <label>Enter Verification Code</label>
                                <div className="otp-input-wrapper">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={handleOtpChange}
                                        placeholder="0000000"
                                        maxLength={7}
                                        className={`otp-input ${errors.otp ? 'error' : ''}`}
                                        disabled={isLoading || isOtpVerifying || isResendingOtp}
                                    />
                                    {isOtpVerifying && (
                                        <div className="otp-verifying">
                                            <Loader size={20} className="spinner" /> Verifying...
                                        </div>
                                    )}
                                </div>
                                {errors.otp && <span className="error-message"><AlertCircle size={14} /> {errors.otp}</span>}
                            </div>

                            <div className="otp-actions">
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResendOtp}
                                    disabled={isResendingOtp}
                                >
                                    {isResendingOtp ? 'Resending...' : 'Resend Code'}
                                </button>
                            </div>

                            <div className="transaction-summary">
                                <h3>Transaction Summary</h3>
                                <div className="summary-item"><span>From:</span><span>{selectedAccount?.name}</span></div>
                                {formData.transferType === 'external' ? (
                                    <>
                                        <div className="summary-item"><span>To:</span><span>{formData.recipientName}</span></div>
                                        <div className="summary-item"><span>Account:</span><span>{formData.recipientAccount}</span></div>
                                        <div className="summary-item"><span>Sort Code:</span><span>{formData.sortCode}</span></div>
                                    </>
                                ) : (
                                    <div className="summary-item"><span>To:</span><span>{accounts.find(acc => acc.id === formData.toAccountId)?.name}</span></div>
                                )}
                                <div className="summary-item"><span>Amount:</span><span className="amount">{formatCurrency(formData.amount)}</span></div>
                                <div className="summary-item"><span>Description:</span><span>{formData.description}</span></div>
                                {formData.schedulePayment && (
                                    <div className="summary-item"><span>Scheduled:</span><span>{new Date(formData.scheduleDate).toLocaleDateString('en-GB')}</span></div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isLoading || isOtpVerifying || otp.length !== 7}
                            >
                                Verify & Complete Transfer
                            </button>
                        </form>
                    </div>
                )}

                {step === 'success' && (
                    <div className="success-container">
                        <div className="success-icon"><CheckCircle size={64} /></div>
                        <h2>{formData.schedulePayment ? 'Payment Scheduled Successfully' : 'Transfer Completed Successfully'}</h2>
                        <p>{formData.schedulePayment ? 'Your payment has been scheduled and will be processed on the selected date.' : 'Your transfer has been processed successfully.'}</p>

                        <div id="receipt-content" className="receipt-container">
                            <div className="receipt-header">
                                <h3>RadiantMoney Bank</h3>
                                <p>Transaction Receipt</p>
                            </div>

                            <div className="receipt-details">
                                <div className="detail-row">
                                    <span className="detail-label">Transaction Reference:</span>
                                    <span className="detail-value">{transactionReference}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Date & Time:</span>
                                    <span className="detail-value">{transferTimestamp.toLocaleString('en-GB')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">From Account:</span>
                                    <span className="detail-value">{selectedAccount?.name} (••••{selectedAccount?.number?.slice(-4)})</span>
                                </div>
                                {formData.transferType === 'external' ? (
                                    <>
                                        <div className="detail-row">
                                            <span className="detail-label">Recipient:</span>
                                            <span className="detail-value">{formData.recipientName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Account Number:</span>
                                            <span className="detail-value">{formData.recipientAccount}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Sort Code:</span>
                                            <span className="detail-value">{formData.sortCode} ({formData.bankName || 'N/A'})</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="detail-row">
                                        <span className="detail-label">To Account:</span>
                                        <span className="detail-value">{accounts.find(acc => acc.id === formData.toAccountId)?.name} (••••{accounts.find(acc => acc.id === formData.toAccountId)?.number?.slice(-4)})</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Amount:</span>
                                    <span className="detail-value amount-highlight">{formatCurrency(formData.amount)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Description:</span>
                                    <span className="detail-value">{formData.description}</span>
                                </div>
                                {formData.schedulePayment && (
                                    <div className="detail-row">
                                        <span className="detail-label">Scheduled Date:</span>
                                        <span className="detail-value">{new Date(formData.scheduleDate).toLocaleDateString('en-GB')}</span>
                                    </div>
                                )}
                                {/* Estimated Delivery row removed – UK transfers are instant */}
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className="detail-value status-completed">Completed</span>
                                </div>
                            </div>

                            <div className="receipt-footer">
                                <p>Thank you for banking with RadiantMoney</p>
                                <p className="disclaimer">This is an electronically generated receipt and does not require a signature.</p>
                            </div>
                        </div>

                        <div className="receipt-actions">
                            <button className="action-btn print-btn" onClick={handlePrintReceipt}>
                                <Printer size={18} /> Print Receipt
                            </button>
                            <button className="action-btn download-btn" onClick={handleDownloadReceipt}>
                                <Download size={18} /> Download Receipt
                            </button>
                        </div>

                        <button className="done-btn" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendMoney;