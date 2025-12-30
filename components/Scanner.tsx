
import React, { useState, useRef } from 'react';
import { extractTransactionsFromStatement } from '../services/geminiService';
import { Transaction } from '../types';
import { PDFDocument } from 'pdf-lib';

interface Props {
  onAddMany: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
}

const Scanner: React.FC<Props> = ({ onAddMany }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pendingFile, setPendingFile] = useState<{ buffer: ArrayBuffer; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to safely convert ArrayBuffer/Uint8Array to Base64
  const bufferToBase64 = (buffer: ArrayBuffer | Uint8Array): Promise<string> => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer]);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to convert file to Base64"));
      reader.readAsDataURL(blob);
    });
  };

  const processFile = async (arrayBuffer: ArrayBuffer, mimeType: string, password?: string) => {
    setIsScanning(true);
    setError(null);
    setPasswordError(null);

    try {
      let finalBase64: string;
      
      if (mimeType === 'application/pdf') {
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer, { 
            password: password || undefined,
            ignoreEncryption: false 
          } as any);
          
          const pdfBytes = await pdfDoc.save();
          finalBase64 = await bufferToBase64(pdfBytes);
        } catch (err: any) {
          const msg = (err.message || "").toLowerCase();
          const name = (err.name || "").toLowerCase();
          
          const isEncryptionError = 
            msg.includes('password') || 
            msg.includes('encrypted') || 
            msg.includes('decrypt') ||
            msg.includes('not authorized') ||
            msg.includes('code 4') ||
            name.includes('password') ||
            name.includes('encrypted');

          if (isEncryptionError) {
            setPendingFile({ buffer: arrayBuffer, mimeType });
            setShowPasswordPrompt(true);
            if (password) {
              setPasswordError("Incorrect password. Please try again.");
              setPdfPassword('');
            }
            setIsScanning(false);
            return;
          }
          throw err;
        }
      } else {
        finalBase64 = await bufferToBase64(arrayBuffer);
      }

      const results = await extractTransactionsFromStatement(finalBase64, mimeType);
      
      if (results && results.length > 0) {
        const cleaned = results.map(r => ({
          date: r.date || new Date().toISOString().split('T')[0],
          description: r.description || 'Unnamed Transaction',
          amount: Math.abs(r.amount || 0),
          category: (r.category as any) || 'Other',
          type: r.type || 'expense'
        })) as Omit<Transaction, 'id' | 'createdAt'>[];
        
        onAddMany(cleaned);
        setShowPasswordPrompt(false);
        setPendingFile(null);
        setPdfPassword('');
      } else {
        setShowPasswordPrompt(false);
        setError("The AI couldn't find any clear transactions in this document.");
      }
    } catch (err: any) {
      console.error("Scanner process error:", err);
      setShowPasswordPrompt(false); 
      setError(err.message || "An unexpected error occurred during scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large (Max 20MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      processFile(arrayBuffer, mimeType);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsArrayBuffer(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingFile && pdfPassword) {
      processFile(pendingFile.buffer, pendingFile.mimeType, pdfPassword);
    }
  };

  const cancelPasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setPendingFile(null);
    setPdfPassword('');
    setPasswordError(null);
    setIsScanning(false);
  };

  return (
    <>
      {/* Global Password Modal (Pop up) */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
            onClick={cancelPasswordPrompt}
          />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-[2rem] shadow-2xl animate-modal text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h4 className="text-xl font-black text-white mb-2">Protected Document</h4>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              This PDF is password-protected. We need the password to decrypt it for AI extraction.
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <input
                  autoFocus
                  type="password"
                  autoComplete="current-password"
                  disabled={isScanning}
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Enter PDF Password"
                  className={`w-full px-6 py-4 bg-slate-800 border ${passwordError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-700'} rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-white font-bold transition-all placeholder:text-slate-600`}
                />
                {passwordError && (
                  <p className="text-xs text-rose-500 font-bold uppercase tracking-tight">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  disabled={isScanning}
                  onClick={cancelPasswordPrompt}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isScanning || !pdfPassword}
                  className="flex-[2] py-4 bg-emerald-500 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Decrypting...
                    </>
                  ) : 'Unlock & Extract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">AI Scanner</h3>
            <p className="text-slate-400 text-xs">Extract data from images or PDFs</p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            disabled={isScanning}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isScanning ? 'bg-slate-800 border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}>
            {isScanning ? (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-28 bg-slate-700/50 rounded-lg border-2 border-slate-600 overflow-hidden shadow-2xl">
                  <div className="p-3 space-y-2 opacity-20">
                    <div className="h-2 bg-slate-400 rounded w-full"></div>
                    <div className="h-2 bg-slate-400 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-400 rounded w-full"></div>
                    <div className="h-2 bg-slate-400 rounded w-1/2"></div>
                  </div>
                  <div className="absolute left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_15px_4px_rgba(52,211,153,0.7)] animate-scan"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:10px_10px] opacity-10"></div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">Analyzing Document</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Extracting line items via Gemini AI...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold">Drop statement here</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Images or PDF up to 20MB</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 items-start animate-in slide-in-from-top-2 duration-300">
            <div className="mt-0.5">
              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-rose-200 text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Scanner;
