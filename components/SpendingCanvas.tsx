
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Transaction, CurrencyCode, CURRENCIES } from '../types';

interface Props {
  transactions: Transaction[];
  currencyCode: CurrencyCode;
}

const SpendingCanvas: React.FC<Props> = ({ transactions, currencyCode }) => {
  const currency = CURRENCIES[currencyCode];

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; expense: number; income: number }> = {};
    
    // Sort transactions to get date range
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return [];

    const start = new Date(sorted[0].date);
    const end = new Date(sorted[sorted.length - 1].date);
    
    // Initialize all dates in range to avoid gaps
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { date: dateStr, expense: 0, income: 0 };
    }

    transactions.forEach(t => {
      if (!dailyData[t.date]) return;
      if (t.type === 'expense') {
        dailyData[t.date].expense += t.amount;
      } else {
        dailyData[t.date].income += t.amount;
      }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 font-bold text-xs space-y-1">
          <p className="text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name.toUpperCase()}</span>
              <span className="text-slate-900">{currency.symbol}{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center overflow-hidden h-full min-h-[400px]">
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h3 className="text-slate-800 text-lg font-black tracking-tight uppercase tracking-[0.1em]">Cash Flow Trend</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Income vs Expenses over time</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Income</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Spend</span>
           </div>
        </div>
      </div>
      
      <div className="flex-1 w-full h-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-300 font-medium italic">
            Add data to see trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                tickFormatter={(val) => val.split('-').slice(2).join('/')}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F1F5F9', strokeWidth: 2 }} />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke="#10b981" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Expense"
                stroke="#f43f5e" 
                strokeWidth={4} 
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SpendingCanvas;
