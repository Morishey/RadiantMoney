import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Account {
  id: string;
  type: string;
  name: string;
  number: string;
  balance: number;
  currency: string;
  trend: number;
}

interface AccountContextType {
  accounts: Account[];
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  deductFromAccount: (accountId: string, amount: number) => boolean;
  refreshAccounts: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const initialAccounts: Account[] = [
  {
    id: '1',
    type: 'checking',
    name: 'Personal Checking',
    number: '•••• 4582',
    balance: 158450.75,
    currency: 'USD',
    trend: 2.5
  },
  {
    id: '2',
    type: 'savings',
    name: 'High-Yield Savings',
    number: '•••• 9123',
    balance: 327890.50,
    currency: 'USD',
    trend: 4.2
  },
  {
    id: '3',
    type: 'investment',
    name: 'Investment Portfolio',
    number: '•••• 3305',
    balance: 634567.89,
    currency: 'USD',
    trend: 8.3
  }
];

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setAccounts(prev =>
      prev.map(acc => (acc.id === accountId ? { ...acc, balance: newBalance } : acc))
    );
  };

  const deductFromAccount = (accountId: string, amount: number): boolean => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return false;
    if (account.balance < amount) return false;
    const newBalance = account.balance - amount;
    updateAccountBalance(accountId, newBalance);
    return true;
  };

  const refreshAccounts = () => {
    const saved = localStorage.getItem('accounts');
    if (saved) {
      setAccounts(JSON.parse(saved));
    }
  };

  return (
    <AccountContext.Provider value={{ accounts, updateAccountBalance, deductFromAccount, refreshAccounts }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};