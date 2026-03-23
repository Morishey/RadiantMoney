import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountContext';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { ArrowRightLeft } from 'lucide-react';
import {
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
    Gift,
    PiggyBank,
    Repeat,
    Menu,
    X,
    Mail,
    Phone,
    Calendar,
    Filter,
    Download as DownloadIcon,
    Printer,
    Eye,
    EyeOff,
    ShoppingBag,
    AlertCircle,   // added for error messages
    CheckCircle,   // added for success
    Loader         // for loading spinner (already used in mobile)
} from 'lucide-react';
import './DesktopBankingDashboard.css';

interface Investment {
    id: string;
    name: string;
    ticker: string;
    value: number;
    return: number;
    returnPercentage: number;
}

interface SpendingCategory {
    category: string;
    amount: number;
    color: string;
    percentage: number;
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

const DesktopBankingDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { accounts } = useAccounts();
    const { transactions } = useTransactions();

    const [showBalance, setShowBalance] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [timeRange, setTimeRange] = useState('1M');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState('home');

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

    const spendingCategories: SpendingCategory[] = [
        { category: 'Shopping', amount: 2340, color: '#8b5cf6', percentage: 35 },
        { category: 'Dining', amount: 890, color: '#a78bfa', percentage: 15 },
        { category: 'Transport', amount: 450, color: '#c4b5fd', percentage: 8 },
        { category: 'Entertainment', amount: 320, color: '#ddd6fe', percentage: 5 },
        { category: 'Bills', amount: 1850, color: '#ede9fe', percentage: 27 }
    ];

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlyIncome = 12450.00;
    const monthlyExpenses = 8760.00;
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1);

    const menuItems = [
        { id: 'home', icon: <Home size={20} />, label: 'Home' },
        { id: 'accounts', icon: <Wallet size={20} />, label: 'Accounts' },
        { id: 'transactions', icon: <CreditCard size={20} />, label: 'Transactions' },
        { id: 'investments', icon: <TrendingUp size={20} />, label: 'Investments' },
        { id: 'analytics', icon: <PieChart size={20} />, label: 'Analytics' },
        { id: 'beneficiaries', icon: <Users size={20} />, label: 'Beneficiaries' },
        { id: 'statements', icon: <FileText size={20} />, label: 'Statements' },
        { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
    ];

    const quickActions = [
        { icon: <Send size={18} />, label: 'Send Money', color: 'primary' },
        { icon: <Download size={18} />, label: 'Request', color: 'success' },
        { icon: <Plus size={18} />, label: 'Add Money', color: 'warning' },
        { icon: <Repeat size={18} />, label: 'Transfer', color: 'info' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
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

        // If we wanted to simulate success, we could add a condition:
        // if (requestRecipient === '1234567890') { // some valid demo account
        //   setIsRequestLoading(true);
        //   setTimeout(() => {
        //     setIsRequestLoading(false);
        //     setRequestSuccess(true);
        //     setTimeout(() => {
        //       setIsRequestModalOpen(false);
        //       setRequestSuccess(false);
        //     }, 2000);
        //   }, 2000);
        // } else {
        //   setRequestError('Account not found');
        // }
    };

    return (
        <div className="desktop-dashboard">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
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
                                <label htmlFor="requestRecipient">CrestcoastHub Account Number</label>
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
                                            {acc.name} (${acc.balance.toLocaleString()})
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

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Building size={28} className="logo-icon" />
                        <span className="logo-text">CrestcoastHub</span>
                    </div>
                    <button
                        className="close-sidebar-btn"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="user-info">
                    <div className="user-avatar">
                        <User size={24} />
                    </div>
                    <div className="user-details">
                        <span className="user-name">Marc Goldberg </span>
                        <span className="user-email">hovacation45@gmail.com</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenuItem === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMenuItem(item.id);
                                setIsSidebarOpen(false);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="footer-item">
                        <HelpCircle size={20} />
                        <span>Help</span>
                    </button>
                    <button className="footer-item" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="desktop-header">
                    <div className="header-left">
                        <button
                            className="menu-toggle"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="date-display">
                            <Calendar size={16} />
                            <span>{new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search..." className="search-input" />
                        </div>

                        <button className="notification-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>

                        <button className="profile-btn">
                            <User size={20} />
                        </button>
                    </div>
                </header>

                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h2>Welcome back, Marc! 👋</h2>
                    </div>
                    <div className="banner-actions">
                        <button className="action-btn primary">
                            <Download size={16} />
                            Download Statement
                        </button>
                        <button className="action-btn">
                            <Printer size={16} />
                            Print
                        </button>
                    </div>
                </div>

                {/* Balance Overview Cards */}
                <div className="balance-overview">
                    <div className="balance-card main">
                        <div className="card-header">
                            <span className="label">Total Balance</span>
                            <button
                                className="toggle-visibility"
                                onClick={() => setShowBalance(!showBalance)}
                            >
                                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="balance-amount">
                            {showBalance ? `$${totalBalance.toLocaleString()}` : '••••••'}
                        </div>
                        <div className="balance-trend">
                            <span className="trend positive">
                                <ArrowUpRight size={16} />
                                +2.4%
                            </span>
                            <span className="trend-period">vs last month</span>
                        </div>
                    </div>

                    <div className="balance-card">
                        <div className="card-header">
                            <span className="label">Monthly Income</span>
                            <DollarSign size={18} className="card-icon income" />
                        </div>
                        <div className="balance-amount small">
                            {showBalance ? `$${monthlyIncome.toLocaleString()}` : '••••••'}
                        </div>
                        <div className="balance-footer">
                            <span className="trend positive">
                                <ArrowUpRight size={14} />
                                +8.2%
                            </span>
                        </div>
                    </div>

                    <div className="balance-card">
                        <div className="card-header">
                            <span className="label">Monthly Expenses</span>
                            <ArrowDownRight size={18} className="card-icon expense" />
                        </div>
                        <div className="balance-amount small">
                            {showBalance ? `$${monthlyExpenses.toLocaleString()}` : '••••••'}
                        </div>
                        <div className="balance-footer">
                            <span className="trend negative">
                                <ArrowDownRight size={14} />
                                +3.1%
                            </span>
                        </div>
                    </div>

                    <div className="balance-card">
                        <div className="card-header">
                            <span className="label">Savings Rate</span>
                            <PiggyBank size={18} className="card-icon savings" />
                        </div>
                        <div className="balance-amount small">
                            {savingsRate}%
                        </div>
                        <div className="balance-footer">
                            <span className="trend positive">
                                <ArrowUpRight size={14} />
                                +2.1%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className={`quick-action-card ${action.color}`}
                                onClick={() => {
                                    if (action.label === 'Send Money' || action.label === 'Transfer') {
                                        navigate('/send-money');
                                    } else if (action.label === 'Request') {
                                        setIsRequestModalOpen(true);
                                        setRequestRecipient('');
                                        setRequestToAccountId(accounts[0]?.id || '');
                                        setRequestError('');
                                        setRequestSuccess(false);
                                    }
                                }}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <span className="action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accounts and Charts Row */}
                <div className="dashboard-row">
                    {/* Accounts List */}
                    <div className="accounts-section">
                        <div className="section-header">
                            <h3>Your Accounts</h3>
                            <button className="view-all-btn">
                                View All
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="accounts-grid">
                            {accounts.map((account) => (
                                <div key={account.id} className="account-card">
                                    <div className="account-card-header">
                                        <div className="account-type">
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
                                        <div>
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
                    </div>

                    {/* Spending Chart */}
                    <div className="spending-section">
                        <div className="section-header">
                            <h3>Spending Overview</h3>
                            <select className="time-range" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                                <option value="1W">Last Week</option>
                                <option value="1M">Last Month</option>
                                <option value="3M">Last 3 Months</option>
                                <option value="1Y">Last Year</option>
                            </select>
                        </div>
                        <div className="chart-container">
                            <div className="bar-chart">
                                {spendingCategories.map((category, index) => (
                                    <div key={index} className="chart-bar-item">
                                        <div className="bar-label">{category.category}</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${category.percentage}%`,
                                                    backgroundColor: category.color
                                                }}
                                            ></div>
                                        </div>
                                        <div className="bar-value">${category.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions and Investments Row */}
                <div className="dashboard-row">
                    {/* Recent Transactions */}
                    <div className="transactions-section">
                        <div className="section-header">
                            <h3>Recent Transactions</h3>
                            <div className="header-actions">
                                <button className="filter-btn">
                                    <Filter size={16} />
                                    Filter
                                </button>
                                <button className="view-all-btn">
                                    View All
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="transactions-table">
                            <div className="table-header">
                                <span>Description</span>
                                <span>Category</span>
                                <span>Date</span>
                                <span>Status</span>
                                <span>Amount</span>
                            </div>
                            <div className="table-body">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="table-row">
                                        <div className="transaction-info">
                                            <div className="transaction-icon">
                                                {getIcon(transaction.iconName)}
                                            </div>
                                            <span className="transaction-name">{transaction.name}</span>
                                        </div>
                                        <span className="transaction-category">{transaction.category}</span>
                                        <span className="transaction-date">{transaction.date}</span>
                                        <span className={`transaction-status ${transaction.status}`}>
                                            {transaction.status}
                                        </span>
                                        <span className={`transaction-amount ${transaction.type}`}>
                                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Investments */}
                    <div className="investments-section">
                        <div className="section-header">
                            <h3>Investments</h3>
                            <button className="view-all-btn">
                                View Portfolio
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="investments-list">
                            {investments.map((investment) => (
                                <div key={investment.id} className="investment-item">
                                    <div className="investment-info">
                                        <span className="investment-name">{investment.name}</span>
                                        <span className="investment-ticker">{investment.ticker}</span>
                                    </div>
                                    <div className="investment-values">
                                        <span className="investment-value">
                                            ${investment.value.toLocaleString()}
                                        </span>
                                        <span className={`investment-return ${investment.return >= 0 ? 'positive' : 'negative'}`}>
                                            {investment.return >= 0 ? '+' : ''}{investment.returnPercentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Offers Section */}
                <div className="offers-section">
                    <div className="section-header">
                        <h3>Special Offers & Rewards</h3>
                        <button className="view-all-btn">
                            View All Offers
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="offers-grid">
                        <div className="offer-card">
                            <Gift size={24} className="offer-icon" />
                            <div className="offer-content">
                                <h4>2% Cashback on Shopping</h4>
                                <p>Use your debit card for online purchases and get 2% cashback</p>
                                <button className="offer-cta">Learn More</button>
                            </div>
                        </div>
                        <div className="offer-card">
                            <Zap size={24} className="offer-icon" />
                            <div className="offer-content">
                                <h4>Zero Fee Transfers</h4>
                                <p>Free international transfers for the next 3 months</p>
                                <button className="offer-cta">Activate Now</button>
                            </div>
                        </div>
                        <div className="offer-card">
                            <TrendingUp size={24} className="offer-icon" />
                            <div className="offer-content">
                                <h4>Investment Bonus</h4>
                                <p>Get $50 when you invest $1000 in any fund</p>
                                <button className="offer-cta">Start Investing</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DesktopBankingDashboard;