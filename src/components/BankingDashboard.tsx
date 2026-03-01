import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    RefreshCw
} from 'lucide-react';
import './BankingDashboard.css'; // Fixed path (assumes same folder)

interface Transaction {
    id: string;
    name: string;
    date: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'completed' | 'pending' | 'failed';
    category: string;
    icon?: React.ReactNode;
}

interface Account {
    id: string;
    type: string;
    name: string;
    number: string;
    balance: number;
    currency: string;
    trend: number;
}

interface Investment {
    id: string;
    name: string;
    ticker: string;
    value: number;
    return: number;
    returnPercentage: number;
}

const BankingDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [showBalance, setShowBalance] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState('checking');
    const [timeRange, setTimeRange] = useState('1M');

    // Mock data
    const accounts: Account[] = [
        {
            id: '1',
            type: 'checking',
            name: 'Personal Checking',
            number: '•••• 4582',
            balance: 28450.75,
            currency: 'USD',
            trend: 2.5
        },
        {
            id: '2',
            type: 'savings',
            name: 'High-Yield Savings',
            number: '•••• 9123',
            balance: 127890.50,
            currency: 'USD',
            trend: 4.2
        },
        {
            id: '4',
            type: 'investment',
            name: 'Investment Portfolio',
            number: '•••• 3305',
            balance: 234567.89,
            currency: 'USD',
            trend: 8.3
        }
    ];

    const recentTransactions: Transaction[] = [
        {
            id: '1',
            name: 'Apple Store',
            date: 'Today, 2:30 PM',
            amount: 1299.99,
            type: 'debit',
            status: 'completed',
            category: 'Shopping',
            icon: <CreditCard size={18} />
        },
        {
            id: '2',
            name: 'Salary Deposit',
            date: 'Yesterday',
            amount: 5500.00,
            type: 'credit',
            status: 'completed',
            category: 'Income',
            icon: <DollarSign size={18} />
        },
        {
            id: '3',
            name: 'Netflix Subscription',
            date: 'Dec 12, 2025',
            amount: 15.99,
            type: 'debit',
            status: 'completed',
            category: 'Entertainment',
            icon: <Zap size={18} />
        },
        {
            id: '4',
            name: 'Wire Transfer to Savings',
            date: 'Dec 10, 2025',
            amount: 2000.00,
            type: 'debit',
            status: 'completed',
            category: 'Transfer',
            icon: <Send size={18} />
        },
        {
            id: '5',
            name: 'Amazon Web Services',
            date: 'Dec 8, 2025',
            amount: 47.50,
            type: 'debit',
            status: 'pending',
            category: 'Business',
            icon: <Briefcase size={18} />
        },
        {
            id: '6',
            name: 'Dividend Payment',
            date: 'Dec 5, 2025',
            amount: 125.75,
            type: 'credit',
            status: 'completed',
            category: 'Investment',
            icon: <TrendingUp size={18} />
        }
    ];

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

    // Navigation items – changed first label from 'Dashboard' to 'Home'
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

    return (
        <div className="mobile-dashboard">
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
                        <Building size={24} className="logo-icon" />
                        <span className="logo-text">CrestcoastHub</span>
                    </div>
                </div>
                <div className="header-right">
                    <button className="notification-btn">
                        <Bell size={22} />
                        <span className="notification-badge">3</span>
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            <div className="search-container">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search transactions, accounts..."
                        className="search-input"
                    />
                </div>
            </div>

            {/* Mobile Side Menu */}
            {isMobileMenuOpen && (
                <div className="menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="menu-sidebar" onClick={e => e.stopPropagation()}>
                        <div className="menu-header">
                            <div className="menu-logo">
                                <Building size={28} className="menu-logo-icon" />
                                <span className="menu-logo-text">CrestcoastHub</span>
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
                                <span className="user-fullname">John Anderson</span>
                                <span className="user-email">john@crestbank.com</span>
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
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-text">
                        <h1>Welcome back, John! 👋</h1>
                        <p>Here's your financial overview</p>
                    </div>
                    <div className="date-badge">
                        <Clock size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>

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
                        {showBalance ? `$${totalBalance.toLocaleString()}` : '••••••'}
                    </div>

                    {/* Income, Expenses, Savings in one row */}
                    <div className="financial-summary">
                        <div className="summary-item">
                            <div className="summary-icon income">
                                <ArrowUpRight size={16} />
                            </div>
                            <div className="summary-details">
                                <span className="summary-label">Income</span>
                                <span className="summary-value">${monthlyIncome.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <div className="summary-icon expense">
                                <ArrowDownRight size={16} />
                            </div>
                            <div className="summary-details">
                                <span className="summary-label">Expenses</span>
                                <span className="summary-value">${monthlyExpenses.toLocaleString()}</span>
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
                            onClick={() => {
                                if (action.label === 'Send') {
                                    navigate('/SendMoney');
                                }
                                // Add handlers for other actions as needed
                            }}
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
                                    {account.type === 'checking' && <Wallet size={20} />}
                                    {account.type === 'savings' && <Shield size={20} />}
                                    {account.type === 'investment' && <TrendingUp size={20} />}
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
                                        {showBalance ? `$${account.balance.toLocaleString()}` : '••••••'}
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
                        <span className="card-balance">$12,450</span>
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
                    {recentTransactions.slice(0, 4).map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                            <div className="transaction-icon-wrapper">
                                {transaction.icon}
                            </div>
                            <div className="transaction-details">
                                <div className="transaction-top">
                                    <span className="transaction-name">{transaction.name}</span>
                                    <span className={`transaction-amount ${transaction.type}`}>
                                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
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