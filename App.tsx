
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category, CurrencyCode, CURRENCIES } from './types';
import TransactionForm from './components/TransactionForm';
import Scanner from './components/Scanner';
import SpendingCanvas from './components/SpendingCanvas';
import TransactionModal from './components/TransactionModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('fin_currency');
    return (saved as CurrencyCode) || 'MYR';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fin_currency', currencyCode);
  }, [currencyCode]);

  const currency = CURRENCIES[currencyCode];
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2
  });

  // Memoized sorted transactions - Latest date first
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addManyTransactions = (ts: Omit<Transaction, 'id'>[]) => {
    const newOnes = ts.map(t => ({ ...t, id: Math.random().toString(36).substr(2, 9) }));
    setTransactions(prev => [...newOnes, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const chartData = useMemo(() => {
    const daily: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        daily[t.date] = (daily[t.date] || 0) + t.amount;
      }
    });
    return Object.entries(daily)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transactions={sortedTransactions} 
        onDelete={deleteTransaction} 
        currencyCode={currencyCode}
      />

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.location.reload()}>
            <span className="text-2xl font-bold tracking-tighter text-slate-800">M</span>
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              <div className="relative z-10 w-[2px] h-3 bg-white/80 rounded-full"></div>
              {/* Sparkle effect mimicking the logo */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-slate-800">ni</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select 
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                className="bg-slate-100 border-none rounded-lg text-sm font-semibold px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer pr-8"
              >
                {Object.values(CURRENCIES).map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => setIsModalOpen(true)} className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Transactions
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                 <div className="w-4 h-4 bg-emerald-500 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1 relative z-10">Total Balance</p>
              <h2 className="text-4xl font-bold mb-6 relative z-10">
                {formatter.format(stats.balance)}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-xs text-emerald-100 mb-1">Income</p>
                  <p className="text-lg font-semibold">{currency.symbol}{stats.income.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-xs text-emerald-100 mb-1">Expenses</p>
                  <p className="text-lg font-semibold">{currency.symbol}{stats.expenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <TransactionForm onAdd={addTransaction} currencyCode={currencyCode} />
            <Scanner onAddMany={addManyTransactions} />
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SpendingCanvas transactions={transactions} currencyCode={currencyCode} />
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-4">Daily Spendings ({currency.symbol})</h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#94a3b8'}}
                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                      <Tooltip 
                        formatter={(value) => [`${currency.symbol}${value}`, 'Amount']}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 group"
                >
                  View All
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                      <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      sortedTransactions.slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap mono">
                            {t.date}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-800 block">{t.description}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {t.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatter.format(t.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => deleteTransaction(t.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {sortedTransactions.length > 5 && (
                <div className="px-6 py-4 bg-slate-50 text-center">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800"
                  >
                    + {sortedTransactions.length - 5} more transactions. <span className="text-emerald-600">View all</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
