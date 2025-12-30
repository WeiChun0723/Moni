
import React, { useState } from 'react';
import { extractTransactionsFromStatement } from '../services/geminiService';
import { Transaction } from '../types';

interface Props {
  onAddMany: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
}

const Scanner: React.FC<Props> = ({ onAddMany }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        
        const results = await extractTransactionsFromStatement(base64, mimeType);
        
        if (results && results.length > 0) {
          // Cast back to standard transaction data
          const cleaned = results.map(r => ({
            date: r.date || new Date().toISOString().split('T')[0],
            description: r.description || 'Unnamed Transaction',
            amount: Math.abs(r.amount || 0),
            category: (r.category as any) || 'Other',
            type: r.type || 'expense'
          })) as Omit<Transaction, 'id' | 'createdAt'>[];
          
          onAddMany(cleaned);
        } else {
          setError("Could not find any transactions in this image.");
        }
        setIsScanning(false);
      };
    } catch (err) {
      setError("An error occurred during scanning.");
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">AI Scanner</h3>
          <p className="text-slate-400 text-xs">Upload receipt or statement</p>
        </div>
        <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isScanning}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed border-slate-700 rounded-xl p-8 text-center transition-all ${isScanning ? 'bg-slate-800 border-emerald-500' : 'hover:border-slate-600 hover:bg-slate-800'}`}>
          {isScanning ? (
            <div className="space-y-3">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full"></div>
              <p className="text-sm font-medium text-emerald-400">Moni is analyzing...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-500">JPG, PNG, WebP</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default Scanner;
