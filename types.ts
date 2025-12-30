
export type Category = 
  | 'Rent' 
  | 'Savings' 
  | 'Shop' 
  | 'Fun' 
  | 'Food'
  | 'Transport'
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
  createdAt: number; // Added for stable sorting sequence
}

// Colors updated to match the poster's vibrant palette
export const CATEGORY_COLORS: Record<Category, string> = {
  Rent: '#10b981',      // Emerald Green
  Savings: '#fb923c',   // Vibrant Orange
  Shop: '#60a5fa',      // Electric Blue
  Fun: '#f43f5e',       // Soft Rose/Red
  Food: '#f472b6',      // Pink
  Transport: '#818cf8', // Indigo
  Income: '#10b981',    // Emerald
  Other: '#94a3b8'      // Slate
};

// Map categories to the poster's icons (simplified for web)
export const CATEGORY_ICONS: Record<Category, string> = {
  Rent: '🏠',
  Savings: '💰',
  Shop: '🛍️',
  Fun: '🎮',
  Food: '🍱',
  Transport: '🚗',
  Income: '📈',
  Other: '✨'
};
