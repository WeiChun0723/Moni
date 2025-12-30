
import React, { useState } from 'react';
import { Category, Transaction, CurrencyCode, CURRENCIES } from '../types';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  currencyCode: CurrencyCode;
}

const CATEGORIES: Category[] = [
  'Rent', 'Savings', 'Shop', 'Fun', 'Food', 'Transport', 'Income', 'Other'
];

const TransactionForm: React.FC<Props> = ({ onAdd, currencyCode }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Rent');
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
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <h3 className="text-xl font-black text-slate-800 tracking-tight">Manual Entry</h3>
      
      <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${type === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Income
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">What for?</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
            placeholder="Description..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm font-bold"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">When?</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-xs font-bold uppercase"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none text-sm font-bold"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-500 text-white text-sm font-black rounded-[1.5rem] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 uppercase tracking-widest mt-2"
        >
          Confirm Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
