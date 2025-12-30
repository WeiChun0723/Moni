
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category, CurrencyCode, CURRENCIES, CATEGORY_COLORS, CATEGORY_ICONS } from './types';
import TransactionForm from './components/TransactionForm';
import Scanner from './components/Scanner';
import SpendingCanvas from './components/SpendingCanvas';
import TransactionModal from './components/TransactionModal';

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

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      // Secondary sort: Use createdAt to maintain insertion sequence for same-day transactions
      return b.createdAt - a.createdAt;
    });
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = { 
      ...t, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now() 
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addManyTransactions = (ts: Omit<Transaction, 'id' | 'createdAt'>[]) => {
    // Generate timestamps in order to preserve the sequence from the scanner
    const now = Date.now();
    const newOnes: Transaction[] = ts.map((t, index) => ({ 
      ...t, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now + index // Tiny offset to preserve sequence
    }));
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

  const categorySpending = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      }
    });
    return totals;
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 pb-20 font-sans">
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transactions={sortedTransactions} 
        onDelete={deleteTransaction} 
        currencyCode={currencyCode}
      />

      {/* Modern Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.reload()}>
          <span className="text-3xl font-extrabold tracking-tighter text-[#1F2937]">M</span>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"></div>
            <div className="relative z-10 w-[3px] h-4 bg-white/90 rounded-full"></div>
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px]"></div>
          </div>
          <span className="text-3xl font-extrabold tracking-tighter text-[#1F2937]">ni</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
              className="bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer pr-10 shadow-sm"
            >
              {Object.values(CURRENCIES).map(curr => (
                <option key={curr.code} value={curr.code}>{curr.code}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-10">
        
        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Balance Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden h-full min-h-[340px] flex flex-col justify-center">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl"></div>
            
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Balance Available</p>
            <h2 className="text-5xl font-black mb-8 relative z-10 tracking-tight">
              {formatter.format(stats.balance)}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/5">
                <p className="text-[10px] uppercase font-black text-emerald-100 mb-1">Income</p>
                <p className="text-xl font-bold">+{currency.symbol}{stats.income.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/5">
                <p className="text-[10px] uppercase font-black text-emerald-100 mb-1">Spend</p>
                <p className="text-xl font-bold">-{currency.symbol}{stats.expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Activity Replacement: Recent Activity Section */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[340px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-black text-slate-800 tracking-tight text-lg">Recent Activity</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-emerald-600 shadow-sm hover:bg-emerald-50 transition-colors"
              >
                View History
              </button>
            </div>
            <div className="flex-1 divide-y divide-slate-50 overflow-y-auto">
              {sortedTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-slate-400 font-medium italic">No recent transactions.</p>
                </div>
              ) : (
                sortedTransactions.slice(0, 4).map((t) => (
                  <div key={t.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                        style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}10` }}
                      >
                        {CATEGORY_ICONS[t.category]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{t.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.category} • {t.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatter.format(t.amount)}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Transaction"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight text-slate-800">Budget Categories</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target: 80% used</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {['Rent', 'Savings', 'Shop', 'Fun'].map((cat) => {
              const amount = categorySpending[cat] || 0;
              const color = CATEGORY_COLORS[cat as Category];
              const icon = CATEGORY_ICONS[cat as Category];
              const progress = Math.min((amount / 5000) * 100, 100);

              return (
                <div key={cat} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div 
                      className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${color}15`, color: color }}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{cat}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{formatter.format(amount)}</p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden mt-2">
                       <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%`, backgroundColor: color }}
                       />
                    </div>
                    <div className="flex justify-between w-full text-[10px] font-bold text-slate-400">
                       <span>{Math.round(progress)}%</span>
                       <span>LIMIT</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tools and Main Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <Scanner onAddMany={addManyTransactions} />
            <TransactionForm onAdd={addTransaction} currencyCode={currencyCode} />
          </div>

          <div className="lg:col-span-8">
            <SpendingCanvas transactions={transactions} currencyCode={currencyCode} />
          </div>
        </div>
      </main>

      {/* Subtle background decoration */}
      <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] bg-emerald-100/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed top-20 left-0 w-[30vw] h-[30vw] bg-blue-100/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
    </div>
  );
};

export default App;
