
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Transaction, CATEGORY_COLORS, Category, CurrencyCode, CURRENCIES } from '../types';

interface Props {
  transactions: Transaction[];
  currencyCode: CurrencyCode;
}

const SpendingCanvas: React.FC<Props> = ({ transactions, currencyCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currency = CURRENCIES[currencyCode];

  useEffect(() => {
    if (!canvasRef.current || transactions.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;

    // Process data
    const categoryTotals = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name as Category] || '#ccc'
    }));

    // Bubble layout
    const pack = d3.pack().size([width, height]).padding(10);
    const root = d3.hierarchy({ children: data } as any).sum((d: any) => d.value);
    const nodes = pack(root).leaves();

    context.clearRect(0, 0, width, height);

    nodes.forEach((node: any) => {
      context.beginPath();
      context.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
      context.fillStyle = node.data.color;
      context.globalAlpha = 0.8;
      context.fill();
      
      context.strokeStyle = 'white';
      context.lineWidth = 2;
      context.stroke();

      if (node.r > 20) {
        context.globalAlpha = 1;
        context.fillStyle = '#1e293b';
        context.font = 'bold 12px Inter';
        context.textAlign = 'center';
        context.fillText(node.data.name, node.x, node.y);
        context.font = '10px Inter';
        context.fillText(`${currency.symbol}${node.data.value.toFixed(0)}`, node.x, node.y + 14);
      }
    });

  }, [transactions, currencyCode]);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
      <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-4 w-full">Expense Distribution Canvas</h3>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default SpendingCanvas;
