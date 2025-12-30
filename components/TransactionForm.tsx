
import React, { useState } from 'react';
import { Category, Transaction, CurrencyCode, CURRENCIES } from '../types';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  currencyCode: CurrencyCode;
}

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Housing', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Income', 'Other'
];

const TransactionForm: React.FC<Props> = ({ onAdd, currencyCode }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const currency = CURRENCIES[currencyCode];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      type,
      date
    });

    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Add Transaction</h3>
      
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Income
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
            placeholder="e.g. Weekly Groceries"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Amount ({currency.symbol})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all appearance-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
      >
        Save Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
