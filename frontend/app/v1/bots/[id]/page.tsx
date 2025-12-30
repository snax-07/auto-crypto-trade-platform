'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Activity, Target, ShieldAlert, Clock, Zap, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function BotDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [botData, setBotData] = useState<any>(null);

  useEffect(() => {
    const fetchBotDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/bot/${id}`, { withCredentials: true });
        setBotData(res.data.bot);
      } catch (e) {
        console.error("Failed to load bot details");
      }
    };
    if (id) fetchBotDetails();
  }, [id]);

  if (!botData) return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center text-black font-sans uppercase tracking-[0.3em]">
      <div className="animate-bounce font-black text-sm">Synchronizing Data...</div>
    </div>
  );


  const { resultSummary } = botData;
  const isPositive = resultSummary?.pnl >= 0;

  const handleStopBot = async (id : string) => {
        try {
            
            if(!id){
                toast.warning("ID not provided !!")
                return;
            }
        } catch (error) {
            toast.error("Internal error !!!")
        }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 p-4 lg:p-10 font-sans">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} strokeWidth={3} /> Return to Terminal
        </button>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <div className={`w-2 h-2 rounded-full ${botData.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{botData.status}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: 8 Sections */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Strategy Header Card */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-[0.03] text-black">
                <Activity size={240} />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Live Engine</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{botData.pair}</span>
            </div>
            
            <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-8 italic">
                {botData.strategy} <span className="text-gray-200">/</span> QUANTUM V1
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Net Profit</p>
                <p className={`text-3xl font-mono font-bold tracking-tighter ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{resultSummary?.pnl?.toFixed(2)}
                  <span className="text-sm ml-1 text-gray-400">USDT</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">ROI Percentage</p>
                <p className={`text-3xl font-mono font-bold tracking-tighter ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                   {resultSummary?.pnl_percentage?.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Volume</p>
                <p className="text-3xl font-mono font-bold tracking-tighter text-black">
                   ${resultSummary?.total_proceeds?.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Trade History Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black">Execution History</h3>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <th className="px-8 py-5">Order Type</th>
                    <th className="px-8 py-5">Execution Price</th>
                    <th className="px-8 py-5">Quantity</th>
                    <th className="px-8 py-5 text-right">Total (USDT)</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] font-bold">
                  {/* Mapping Sells from resultSummary */}
                  {resultSummary?.sells?.map((trade: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-red-500 italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> SELL
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-black">${trade.price}</td>
                      <td className="px-8 py-5 font-mono text-gray-500">{trade.qty}</td>
                      <td className="px-8 py-5 font-mono text-right text-black">${(trade.price * trade.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Mapping Buys from resultSummary */}
                  {resultSummary?.buys?.map((trade: any, idx: number) => (
                    <tr key={`buy-${idx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-green-500 italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> BUY
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-black">${trade.price}</td>
                      <td className="px-8 py-5 font-mono text-gray-500">{trade.qty}</td>
                      <td className="px-8 py-5 font-mono text-right text-black">${(trade.price * trade.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Sections */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Bot Configuration Card */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-black rounded-3xl flex items-center justify-center shadow-lg shadow-black/20">
                    <Zap className="text-white fill-white" size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-black uppercase italic tracking-tighter leading-none">Quantum Bot</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: {botData.k8sPodName?.split('-').pop()}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center group cursor-help">
                    <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><Target size={14} className="text-black"/> Pair</span>
                    <span className="text-xs font-black text-black uppercase underline decoration-gray-200 underline-offset-4">{botData.pair}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><Clock size={14} className="text-black"/> Session</span>
                    <span className="text-xs font-black text-black">Active</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><ShieldAlert size={14} className="text-black"/> Logic</span>
                    <span className="text-xs font-black text-black uppercase">{botData.strategy}</span>
                </div>
            </div>
          </div>

          {/* Metrics & Kill Switch */}
          <div className="bg-black text-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">System Allocation</h3>
             <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initial Investment</span>
                    <span className="text-sm font-mono font-bold text-white">${resultSummary?.total_cost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Position</span>
                    <span className="text-sm font-mono font-bold text-white">{botData.quantity || '0.00'} UNIT</span>
                </div>
             </div>
             
             <button 
                className="w-full mt-10 h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group"
                onClick={() => {/* Trigger Stop Bot API */}}
             >
                Terminte Instance <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
             </button>
          </div>

          {/* Information Note */}
          <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
             <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-tighter">
                Note: Performance metrics are recalculated every 60 seconds based on exchange oracle prices. High volatility may cause slippage.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}