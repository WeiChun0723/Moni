
export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Housing' 
  | 'Entertainment' 
  | 'Utilities' 
  | 'Shopping' 
  | 'Health' 
  | 'Income'
  | 'Other';

export type CurrencyCode = 'MYR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  MYR: { code: 'MYR', symbol: 'RM', locale: 'en-MY' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
};

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: 'expense' | 'income';
}

export interface SpendingData {
  category: Category;
  amount: number;
  color: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f87171',
  Transport: '#fbbf24',
  Housing: '#34d399',
  Entertainment: '#818cf8',
  Utilities: '#60a5fa',
  Shopping: '#f472b6',
  Health: '#fb7185',
  Income: '#10b981',
  Other: '#94a3b8'
};
