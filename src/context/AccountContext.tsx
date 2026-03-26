import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
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
  refreshAccounts: () => void; // kept for compatibility
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Initial balances (total = £70,009.67)
const initialAccounts: Account[] = [
  {
    id: '1',
    type: 'checking',
    name: 'Personal Checking',
    number: '•••• 4582',
    balance: 45000.00,
    currency: 'GBP',
    trend: 2.5
  },
  {
    id: '2',
    type: 'savings',
    name: 'High-Yield Savings',
    number: '•••• 9123',
    balance: 20000.00,
    currency: 'GBP',
    trend: 4.2
  },
  {
    id: '3',
    type: 'investment',
    name: 'Investment Portfolio',
    number: '•••• 3305',
    balance: 5009.67,
    currency: 'GBP',
    trend: 8.3
  }
];

const getStorageKey = (userId: string) => `radiantmoney_accounts_${userId}`;

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Load accounts when user changes
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      return;
    }

    const storageKey = getStorageKey(user.id);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored accounts', e);
      }
    }

    // No saved data – use initial accounts
    setAccounts(initialAccounts);
  }, [user]);

  // Save accounts whenever they change (only if user exists)
  useEffect(() => {
    if (user && accounts.length > 0) {
      const storageKey = getStorageKey(user.id);
      localStorage.setItem(storageKey, JSON.stringify(accounts));
    }
  }, [accounts, user]);

  // Sync across tabs
  useEffect(() => {
    if (!user) return;

    const storageKey = getStorageKey(user.id);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const newAccounts = JSON.parse(e.newValue);
          if (Array.isArray(newAccounts)) setAccounts(newAccounts);
        } catch (e) {
          console.error('Failed to parse storage event accounts', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const updateAccountBalance = useCallback((accountId: string, newBalance: number) => {
    setAccounts(prev =>
      prev.map(acc => (acc.id === accountId ? { ...acc, balance: newBalance } : acc))
    );
  }, []);

  const deductFromAccount = useCallback((accountId: string, amount: number): boolean => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return false;
    if (account.balance < amount) return false;
    updateAccountBalance(accountId, account.balance - amount);
    return true;
  }, [accounts, updateAccountBalance]);

  const refreshAccounts = useCallback(() => {
    setAccounts(prev => [...prev]);
  }, []);

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