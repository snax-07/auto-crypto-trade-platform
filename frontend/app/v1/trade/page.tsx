"use client"
import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, BarChart3, History, ChevronRight, LayoutGrid, Zap } from 'lucide-react';
import TradePage from '@/components/tradingCharts/tradingCharts';

// --- Types ---
type TradeType = 'manual' | 'bot';
type OrderMode = 'limit' | 'market';
type Interval = '1m' | '5m' | '15m' | '1H' | '1D';

const WhiteProDashboard: React.FC = () => {
  const [activeSideTab, setActiveSideTab] = useState<TradeType>('manual');
  const [orderMode, setOrderMode] = useState<OrderMode>('limit');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [interval, setInterval] = useState<Interval>('15m');

  // Bot State
  const [botFields, setBotFields] = useState([{ id: '1', label: 'Lower Price', val: '2800' }]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans">
      
      {/* 1. Global Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">Snax Quantum</span>
        </div>
        <div className="flex gap-4">
          <button className="text-xs font-bold px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Log In</button>
          <button className="text-xs font-bold px-4 py-2 bg-black text-white rounded-lg shadow-md">Sign Up</button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex flex-col lg:flex-row flex-1 p-3 gap-3 overflow-hidden">
        
        {/* LEFT & CENTER: OHLCV, Chart, Orderbook, History */}
        <div className="flex flex-col flex-grow gap-3 min-w-0">
          
        <TradePage />

          {/* 4. History Tabs */}
          <div className="h-60 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="flex border-b border-gray-50 px-6 gap-8">
              <button className="py-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black">History</button>
              <button className="py-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors">Open Orders</button>
              <button className="py-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors">Positions</button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="text-gray-400 uppercase">
                  <tr>
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Pair</th>
                    <th className="pb-3">Side</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 font-medium">
                  <tr className="border-t border-gray-50">
                    <td className="py-3 font-mono">14:02:11</td>
                    <td>BTC/USDT</td>
                    <td className="text-green-500 font-bold">BUY</td>
                    <td className="font-mono">64240.00</td>
                    <td className="font-mono">1,250.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. RIGHT SIDEBAR: Trade Controls */}
        <aside className="w-full lg:w-[400px] bg-white border border-gray-200 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col shrink-0">
          
          {/* Main Toggle (Manual vs Bot) */}
          <div className="p-4 flex gap-2 border-b border-gray-50">
            <button 
              onClick={() => setActiveSideTab('manual')}
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all border-2 ${activeSideTab === 'manual' ? 'border-black bg-white shadow-md' : 'border-transparent bg-gray-50 text-gray-400'}`}
            >
              <Zap size={16} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">Manual Trade</span>
            </button>
            <button 
              onClick={() => setActiveSideTab('bot')}
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all border-2 ${activeSideTab === 'bot' ? 'border-black bg-white shadow-md' : 'border-transparent bg-gray-50 text-gray-400'}`}
            >
              <LayoutGrid size={16} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">Trading Bot</span>
            </button>
          </div>

          <div className="p-6 flex-grow overflow-y-auto">
            {activeSideTab === 'manual' ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Order Mode Switcher */}
                <div className="flex gap-4 border-b border-gray-50 text-xs font-bold pb-2">
                  <button onClick={() => setOrderMode('limit')} className={`${orderMode === 'limit' ? 'text-black underline underline-offset-8 decoration-2' : 'text-gray-300'}`}>Limit</button>
                  <button onClick={() => setOrderMode('market')} className={`${orderMode === 'market' ? 'text-black underline underline-offset-8 decoration-2' : 'text-gray-300'}`}>Market</button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Price (USDT)</label>
                    <input type="text" defaultValue="64241.50" className="w-full bg-transparent font-mono text-lg outline-none" disabled={orderMode === 'market'} />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Quantity ({symbol.split('/')[0]})</label>
                    <input type="text" placeholder="0.00" className="w-full bg-transparent font-mono text-lg outline-none" />
                  </div>
                  
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map(p => (
                      <button key={p} className="flex-1 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 hover:border-black hover:text-black transition-all">{p}%</button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all">Buy {symbol.split('/')[0]}</button>
                    <button className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all">Sell {symbol.split('/')[0]}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Bot Parameters</h3>
                  <button 
                    onClick={() => setBotFields([...botFields, { id: Date.now().toString(), label: 'Grid Count', val: '50' }])}
                    className="p-1.5 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {botFields.map((field) => (
                  <div key={field.id} className="relative group">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-transparent group-hover:border-black transition-all">
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">{field.label}</label>
                      <div className="flex justify-between">
                        <input type="text" defaultValue={field.val} className="bg-transparent font-mono text-sm outline-none w-full" />
                        <button onClick={() => setBotFields(botFields.filter(f => f.id !== field.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:shadow-2xl transition-all mt-4">Create Strategy</button>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default WhiteProDashboard;