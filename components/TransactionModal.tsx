
import React from 'react';
import { Transaction, CurrencyCode, CURRENCIES } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currencyCode: CurrencyCode;
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, transactions, onDelete, currencyCode }) => {
  if (!isOpen) return null;

  const currency = CURRENCIES[currencyCode];
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">All Transactions</h2>
            <p className="text-slate-500 text-sm">{transactions.length} total entries • Showing in {currency.code}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                    No transaction history found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4 text-sm text-slate-500 whitespace-nowrap mono">
                      {t.date}
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm font-medium text-slate-800 block">{t.description}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-8 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatter.format(t.amount)}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
        
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
