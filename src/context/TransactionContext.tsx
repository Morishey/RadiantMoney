import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  category: string;
  iconName: string; // e.g., 'send', 'credit', 'debit', 'transfer', etc.
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  {
    id: '1',
    name: 'Apple Store',
    date: 'Today, 2:30 PM',
    amount: 1299.99,
    type: 'debit',
    status: 'completed',
    category: 'Shopping',
    iconName: 'debit'
  },
  {
    id: '2',
    name: 'Salary Deposit',
    date: 'Yesterday',
    amount: 5500.00,
    type: 'credit',
    status: 'completed',
    category: 'Income',
    iconName: 'credit'
  },
  {
    id: '3',
    name: 'Netflix Subscription',
    date: 'Dec 12, 2025',
    amount: 15.99,
    type: 'debit',
    status: 'completed',
    category: 'Entertainment',
    iconName: 'debit'
  },
  {
    id: '4',
    name: 'Wire Transfer to Savings',
    date: 'Dec 10, 2025',
    amount: 2000.00,
    type: 'debit',
    status: 'completed',
    category: 'Transfer',
    iconName: 'transfer'
  },
  {
    id: '5',
    name: 'Amazon Web Services',
    date: 'Dec 8, 2025',
    amount: 47.50,
    type: 'debit',
    status: 'pending',
    category: 'Business',
    iconName: 'debit'
  },
  {
    id: '6',
    name: 'Dividend Payment',
    date: 'Dec 5, 2025',
    amount: 125.75,
    type: 'credit',
    status: 'completed',
    category: 'Investment',
    iconName: 'credit'
  }
];

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};