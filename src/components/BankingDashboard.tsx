import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountContext';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { ArrowRightLeft } from 'lucide-react';
import {
    Menu,
    X,
    Home,
    CreditCard,
    Wallet,
    TrendingUp,
    PieChart,
    Settings,
    Bell,
    User,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Send,
    Download,
    MoreHorizontal,
    DollarSign,
    Shield,
    Zap,
    Globe,
    Clock,
    ChevronRight,
    Users,
    Building,
    Briefcase,
    BarChart3,
    FileText,
    LogOut,
    HelpCircle,
    Phone,
    Gift,
    Target,
    PiggyBank,
    Repeat,
    RefreshCw,
    ShoppingBag,
    Loader,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import './BankingDashboard.css';

interface Investment {
    id: string;
    name: string;
    ticker: string;
    value: number;
    return: number;
    returnPercentage: number;
}

// Helper function to get icon component from iconName
const getIcon = (iconName: string, size: number = 18) => {
    switch (iconName) {
        case 'send':
            return <Send size={size} />;
        case 'credit':
            return <DollarSign size={size} />;
        case 'debit':
            return <CreditCard size={size} />;
        case 'transfer':
            return <Repeat size={size} />;
        case 'investment':
            return <TrendingUp size={size} />;
        case 'business':
            return <Briefcase size={size} />;
        case 'entertainment':
            return <Zap size={size} />;
        case 'shopping':
            return <ShoppingBag size={size} />;
        case 'gift':
            return <Gift size={size} />;
        default:
            return <Send size={size} />;
    }
};

const BankingDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { accounts: rawAccounts } = useAccounts();
    const { transactions } = useTransactions();

    // Filter out checking accounts
    const accounts = rawAccounts.filter(acc => acc.type !== 'checking');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [showBalance, setShowBalance] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState('checking');
    const [timeRange, setTimeRange] = useState('1M');
    const [isNavigating, setIsNavigating] = useState(false);

    // Request modal state
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestRecipient, setRequestRecipient] = useState('');
    const [requestToAccountId, setRequestToAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
    const [requestError, setRequestError] = useState('');
    const [isRequestLoading, setIsRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    // Mock data (investments, spending categories remain local)
    const investments: Investment[] = [
        {
            id: '1',
            name: 'S&P 500 ETF',
            ticker: 'VOO',
            value: 45678.90,
            return: 2345.67,
            returnPercentage: 5.4
        },
        {
            id: '2',
            name: 'Tech Growth Fund',
            ticker: 'TECH',
            value: 23456.78,
            return: 3456.78,
            returnPercentage: 17.3
        },
        {
            id: '3',
            name: 'Government Bonds',
            ticker: 'GOVT',
            value: 15000.00,
            return: 450.00,
            returnPercentage: 3.1
        }
    ];

    const spendingCategories = [
        { category: 'Shopping', amount: 2340, color: '#6366f1' },
        { category: 'Dining', amount: 890, color: '#10b981' },
        { category: 'Transport', amount: 450, color: '#f59e0b' },
        { category: 'Entertainment', amount: 320, color: '#ef4444' },
        { category: 'Bills', amount: 1850, color: '#8b5cf6' }
    ];

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlyIncome = 12450.00;
    const monthlyExpenses = 8760.00;
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1);

    // Navigation items
    const navItems = [
        { icon: <Home size={20} />, label: 'Home', active: true },
        { icon: <CreditCard size={20} />, label: 'Accounts' },
        { icon: <Wallet size={20} />, label: 'Transactions' },
        { icon: <TrendingUp size={20} />, label: 'Investments' },
        { icon: <PieChart size={20} />, label: 'Analytics' },
        { icon: <Users size={20} />, label: 'Beneficiaries' },
        { icon: <FileText size={20} />, label: 'Statements' },
        { icon: <Settings size={20} />, label: 'Settings' }
    ];

    // Bottom navigation items
    const bottomNavItems = [
        { id: 'home', icon: <Home size={24} />, label: 'Home' },
        { id: 'cards', icon: <CreditCard size={24} />, label: 'Cards' },
        { id: 'stats', icon: <BarChart3 size={24} />, label: 'Stats' },
        { id: 'support', icon: <Phone size={24} />, label: 'Support' },
        { id: 'more', icon: <Menu size={24} />, label: 'More' }
    ];

    // Quick action buttons
    const quickActions = [
        { icon: <Send size={20} />, label: 'Send', color: 'from-blue-500 to-blue-600' },
        { icon: <Download size={20} />, label: 'Request', color: 'from-green-500 to-green-600' },
        { icon: <Plus size={20} />, label: 'Add', color: 'from-purple-500 to-purple-600' },
        { icon: <Repeat size={20} />, label: 'Transfer', color: 'from-orange-500 to-orange-600' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleQuickAction = (label: string) => {
        if (label === 'Send' || label === 'Transfer') {
            setIsNavigating(true);
            setTimeout(() => {
                navigate('/send-money');
            }, 4000);
        } else if (label === 'Request') {
            // Open request modal
            setIsRequestModalOpen(true);
            setRequestRecipient('');
            setRequestToAccountId(accounts[0]?.id || '');
            setRequestError('');
            setRequestSuccess(false);
        }
    };

    // Handle request form submission
    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo, any account number is invalid
        if (!requestRecipient.trim()) {
            setRequestError('Account number is required');
            return;
        }
        // Simulate invalid account (always show error)
        setRequestError('Account not found. Please check the number.');
        return;
    };

    return (
        <div className="mobile-dashboard">
            {/* Full‑page navigation loader */}
            {isNavigating && (
                <div className="global-loader">
                    <div className="loader-content">
                        <Loader size={48} className="spinner" />
                        <p>Preparing transfer...</p>
                    </div>
                </div>
            )}

            {/* Request Money Modal */}
            {isRequestModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRequestModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <div className="bank-transfer-icon">
                                    <Building size={16} className="bank-icon" />
                                    <ArrowRightLeft size={14} className="arrow-icon" />
                                    <Building size={16} className="bank-icon" />
                                </div>
                                <h2>Request Money</h2>
                            </div>
                            <button className="modal-close" onClick={() => setIsRequestModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleRequestSubmit}>
                            <div className="form-group">
                                <label htmlFor="requestRecipient">RadiantMoney Account Number</label>
                                <input
                                    type="text"
                                    id="requestRecipient"
                                    value={requestRecipient}
                                    onChange={(e) => {
                                        setRequestRecipient(e.target.value);
                                        setRequestError('');
                                    }}
                                    placeholder="Enter account number"
                                    inputMode="numeric"
                                    maxLength={10}
                                    pattern="\d*"
                                    disabled={isRequestLoading}
                                />
                                {requestError && (
                                    <span className="error-message">
                                        <AlertCircle size={14} /> {requestError}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="requestToAccount">Request into account</label>
                                <select
                                    id="requestToAccount"
                                    value={requestToAccountId}
                                    onChange={(e) => setRequestToAccountId(e.target.value)}
                                    disabled={isRequestLoading}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} (£{acc.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {requestSuccess ? (
                                <div className="success-message">
                                    <CheckCircle size={48} className="success-icon" />
                                    <p>Request sent successfully!</p>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isRequestLoading}
                                >
                                    {isRequestLoading ? 'Sending...' : 'Send Request'}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Mobile Header */}
            <header className="mobile-header">
                <div className="header-left">
                    <button
                        className="menu-button"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <div className="logo-area">
                        <img src="/favicon.svg" alt="RadiantMoney" className="logo-icon" />
                        <span className="logo-text">RadiantMoney</span>
                    </div>
                </div>
                <div className="header-right">
                    <button className="notification-btn">
                        <Bell size={22} />
                        <span className="notification-badge">3</span>
                    </button>
                </div>
            </header>

            {/* Search Bar (commented out) */}
            {/* <div className="search-container">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search transactions, accounts..."
                        className="search-input"
                    />
                </div>
            </div> */}

            {/* Mobile Side Menu */}
            {isMobileMenuOpen && (
                <div className="menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="menu-sidebar" onClick={e => e.stopPropagation()}>
                        <div className="menu-header">
                            <div className="menu-logo">
                                <img src="/favicon.svg" alt="RadiantMoney" className="logo-icon" />
                                <span className="menu-logo-text">RadiantMoney</span>
                            </div>
                            <button
                                className="close-menu"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="user-profile-card">
                            <div className="user-avatar">
                                <User size={24} />
                            </div>
                            <div className="user-details">
                                <span className="user-fullname">Chris Robinson </span>
                                <span className="user-email">chrisrobinson4299@gmail.com</span>
                            </div>
                        </div>

                        <nav className="mobile-nav">
                            {navItems.map((item, index) => (
                                <button key={index} className="mobile-nav-item">
                                    <span className="nav-item-icon">{item.icon}</span>
                                    <span className="nav-item-label">{item.label}</span>
                                    <ChevronRight size={16} className="nav-item-arrow" />
                                </button>
                            ))}
                        </nav>

                        <div className="menu-footer">
                            <button className="menu-footer-item">
                                <HelpCircle size={20} />
                                <span>Help & Support</span>
                            </button>
                            <button
                                className="menu-footer-item logout"
                                onClick={handleLogout}
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="mobile-content">
               
                {/* Welcome Section (commented out) */}
                {/* <div className="welcome-section">
                    <div className="welcome-text">
                        <h1>Welcome back, Pussy Bro! 👋</h1>
                    </div>
                    <div className="date-badge">
                        <Clock size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div> */}

                {/* Balance Card */}
                <div className="balance-card">
                    <div className="balance-header">
                        <span className="balance-label">Total Balance</span>
                        <button
                            className="toggle-balance"
                            onClick={() => setShowBalance(!showBalance)}
                        >
                            {showBalance ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div className="balance-amount">
                        {showBalance ? `£${totalBalance.toLocaleString()}` : '••••••'}
                    </div>

                    {/* Income, Expenses, Savings in one row */}
                    <div className="financial-summary">
                        <div className="summary-item">
                            <div className="summary-icon income">
                                <ArrowUpRight size={16} />
                            </div>
                            <div className="summary-details">
                                <span className="summary-label">Income</span>
                                <span className="summary-value">£{monthlyIncome.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <div className="summary-icon expense">
                                <ArrowDownRight size={16} />
                            </div>
                            <div className="summary-details">
                                <span className="summary-label">Expenses</span>
                                <span className="summary-value">£{monthlyExpenses.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <div className="summary-icon savings">
                                <PiggyBank size={16} />
                            </div>
                            <div className="summary-details">
                                <span className="summary-label">Savings</span>
                                <span className="summary-value">{savingsRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-grid">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className="quick-action-btn"
                            onClick={() => handleQuickAction(action.label)}
                        >
                            <div className={`quick-action-icon bg-gradient-to-r ${action.color}`}>
                                {action.icon}
                            </div>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>

                {/* Accounts Section */}
                <div className="section-header">
                    <h2>Your Accounts</h2>
                    <button className="view-all">
                        View All
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="accounts-scroll">
                    {accounts.map((account) => (
                        <div key={account.id} className="account-card">
                            <div className="account-card-header">
                                <div className="account-type-icon">
                                    {account.type === 'savings' && <Shield size={20} />}
                                    {account.type === 'investment' && <TrendingUp size={20} />}
                                    {account.type === 'checking' && <Wallet size={20} />}
                                </div>
                                <div className="account-info">
                                    <span className="account-name">{account.name}</span>
                                    <span className="account-number">{account.number}</span>
                                </div>
                                <button className="account-menu">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <div className="account-card-footer">
                                <div className="account-balance-info">
                                    <span className="balance-label">Balance</span>
                                    <span className="balance-value">
                                        {showBalance ? `£${account.balance.toLocaleString()}` : '••••••'}
                                    </span>
                                </div>
                                <span className={`trend-badge ${account.trend >= 0 ? 'positive' : 'negative'}`}>
                                    {account.trend >= 0 ? '+' : ''}{account.trend}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cards Section */}
                <div className="cards-preview">
                    <div className="section-header">
                        <h2>Your Cards</h2>
                        <button className="view-all">
                            View All
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="card-preview-item">
                        <div className="card-preview-content">
                            <CreditCard size={24} className="card-icon" />
                            <div className="card-preview-details">
                                <span className="card-type">VISA Platinum</span>
                                <span className="card-number">•••• 4582</span>
                            </div>
                        </div>
                        <span className="card-balance">£12,450</span>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="section-header">
                    <h2>Recent Transactions</h2>
                    <button className="view-all">
                        View All
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="transactions-list">
                    {transactions.slice(0, 4).map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                            <div className="transaction-icon-wrapper">
                                {getIcon(transaction.iconName)}
                            </div>
                            <div className="transaction-details">
                                <div className="transaction-top">
                                    <span className="transaction-name">{transaction.name}</span>
                                    <span className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}£{transaction.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="transaction-bottom">
                                    <span className="transaction-date">{transaction.date}</span>
                                    <span className="transaction-category">{transaction.category}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Offers Section */}
                <div className="offers-section">
                    <div className="section-header">
                        <h2>Special Offers</h2>
                        <button className="view-all">
                            View All
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="offer-card">
                        <Gift size={24} className="offer-icon" />
                        <div className="offer-details">
                            <span className="offer-title">2% Cashback on Shopping</span>
                            <span className="offer-desc">Use your debit card for online purchases</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                {bottomNavItems.map((item) => (
                    <button
                        key={item.id}
                        className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default BankingDashboard;