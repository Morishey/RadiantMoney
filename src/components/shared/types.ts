// Shared TypeScript interfaces
export interface Transaction {
    id: string;
    name: string;
    date: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'completed' | 'pending' | 'failed';
    category: string;
    icon?: React.ReactNode;
}

export interface Account {
    id: string;
    type: string;
    name: string;
    number: string;
    balance: number;
    currency: string;
    trend: number;
}

export interface Investment {
    id: string;
    name: string;
    ticker: string;
    value: number;
    return: number;
    returnPercentage: number;
}