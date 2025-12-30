
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, Category, CurrencyCode, CURRENCIES, CATEGORY_COLORS, CATEGORY_ICONS } from './types';
import TransactionForm from './components/TransactionForm';
import Scanner from './components/Scanner';
import SpendingCanvas from './components/SpendingCanvas';
import TransactionModal from './components/TransactionModal';

const TNGIcon: React.FC = () => (
  <div className="w-12 h-12 rounded-2xl bg-[#005EB8] flex flex-col items-center justify-center overflow-hidden p-1.5 shadow-md border border-white/10 group-hover:scale-110 transition-transform">
    <div className="flex flex-col items-center -space-y-0.5">
      <span className="text-[8px] font-black text-white italic leading-none tracking-tight">Touch</span>
      <span className="text-[10px] font-black text-white italic leading-none tracking-tighter uppercase">'n GO</span>
    </div>
    <span className="text-[8px] font-black text-[#FFEA00] italic leading-none mt-1 uppercase tracking-tighter">eWallet</span>
  </div>
);

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
    const now = Date.now();
    const newOnes: Transaction[] = ts.map((t, index) => ({ 
      ...t, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now + index 
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
    <div className="min-h-[100dvh] bg-[#FDFDFF] text-slate-900 pb-20 font-sans selection:bg-emerald-100">
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transactions={sortedTransactions} 
        onDelete={deleteTransaction} 
        currencyCode={currencyCode}
      />

      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <span className="text-3xl font-extrabold tracking-tighter text-[#1F2937]">M</span>
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"></div>
            <div className="relative z-10 w-[3px] h-4 bg-white/90 rounded-full"></div>
          </div>
          <span className="text-3xl font-extrabold tracking-tighter text-[#1F2937]">ni</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
              className="bg-slate-50 border border-slate-100 rounded-xl text-xs font-black px-3 py-2 appearance-none cursor-pointer pr-8 shadow-sm"
            >
              {Object.values(CURRENCIES).map(curr => (
                <option key={curr.code} value={curr.code}>{curr.code}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl active:scale-95 transition-transform shadow-lg shadow-slate-200">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-6 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden flex flex-col justify-center min-h-[280px]">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <p className="text-emerald-100 text-xs font-black uppercase tracking-[0.2em] mb-2 relative z-10">Total Balance</p>
            <h2 className="text-4xl font-black mb-8 relative z-10 tracking-tight">
              {formatter.format(stats.balance)}
            </h2>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <div className="bg-white/15 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-[9px] uppercase font-black text-emerald-100 mb-0.5">Income</p>
                <p className="text-lg font-bold">+{currency.symbol}{stats.income.toLocaleString()}</p>
              </div>
              <div className="bg-white/15 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-[9px] uppercase font-black text-emerald-100 mb-0.5">Spend</p>
                <p className="text-lg font-bold">-{currency.symbol}{stats.expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[340px]">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h3 className="font-black text-slate-800 tracking-tight text-sm uppercase">Recent Activity</h3>
              <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors">History</button>
            </div>
            <div className="flex-1 divide-y divide-slate-50 overflow-y-auto no-scrollbar">
              {sortedTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-slate-400 text-sm font-medium italic">Start by adding a transaction</p>
                </div>
              ) : (
                sortedTransactions.slice(0, 5).map((t) => {
                  const isTNG = t.description.trim().toUpperCase().startsWith('TNG');
                  return (
                    <div key={t.id} className="px-6 py-4 flex items-center justify-between active:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        {isTNG ? <TNGIcon /> : (
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                            style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}12`, color: CATEGORY_COLORS[t.category] }}
                          >
                            {CATEGORY_ICONS[t.category]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-black text-slate-800 line-clamp-1">{t.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.category} • {t.date}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatter.format(t.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-xl font-black tracking-tight text-slate-800">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Rent', 'Savings', 'Shop', 'Food'].map((cat) => {
              const amount = categorySpending[cat] || 0;
              const color = CATEGORY_COLORS[cat as Category];
              const icon = CATEGORY_ICONS[cat as Category];
              const progress = Math.min((amount / 5000) * 100, 100);

              return (
                <div key={cat} className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm active:scale-95 transition-all">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                      style={{ backgroundColor: `${color}10`, color: color }}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{cat}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatter.format(amount)}</p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <Scanner onAddMany={addManyTransactions} />
            <TransactionForm onAdd={addTransaction} currencyCode={currencyCode} />
          </div>
          <div className="lg:col-span-8">
            <SpendingCanvas transactions={transactions} currencyCode={currencyCode} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 right-0 w-[60vw] h-[60vw] bg-emerald-100/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
    </div>
  );
};

export default App;
