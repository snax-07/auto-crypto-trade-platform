"use client"
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, LayoutGrid, Zap, ArrowRightLeft } from 'lucide-react';
import TradePage from '@/components/tradingCharts/tradingCharts';
import { toast } from 'sonner';
import { useTrade } from '@/hooks/useTrade';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button"

/*--------Types-------*/
type TradeType = 'manual' | 'bot';
type OrderMode = 'LIMIT' | 'MARKET';
type MarketInputType = 'amount' | 'total';
type Tab = "history" | "bots";

export default function Trading() {
  const { market, setMarket, executionOrder } = useTrade(); 
  const { user } = useAuth();

  /*---------------UI States-----------------*/
  const [activeSideTab, setActiveSideTab] = useState<TradeType>('manual');
  const [orderMode, setOrderMode] = useState<OrderMode>('LIMIT');
  const [marketInputType, setMarketInputType] = useState<MarketInputType>('amount');
  const [activeTab, setActiveTab] = useState<Tab>("history");

  const [bots , setBots] = useState([]);
  
  // Local input buffers
  const [limitPrice, setLimitPrice] = useState("");
  const [quantity, setQuantity] = useState("");      
  const [marketValue, setMarketValue] = useState("");  

  /*---------------Logic Implementation---------------*/
  // Synchronizes local UI inputs with the global MarketContext
  useEffect(() => {
    if (activeSideTab === 'manual') {
      setMarket((prev) => {
        const isLimit = orderMode === 'LIMIT';
        const isAmountMode = marketInputType === 'amount';

        // IMPORTANT: We set unused fields to 0 so the Go backend 
        // logic (if val > 0) correctly identifies the intent.
        return {
          ...prev,
          orderType: orderMode,
          price: isLimit ? Number(limitPrice) : 0, 
          quantity: (isLimit || isAmountMode) ? Number(quantity) : 0,
          quoteOrderQty: (!isLimit && !isAmountMode) ? Number(marketValue) : 0,
          strategy: "MANUAL"
        };
      });
    };

    (async ()=> {
      const response = await axios.get("http://localhost:8080/api/v1/bot/getBots" , {withCredentials : true})
      setBots(response.data.bots)
    })()
  }, [orderMode, limitPrice, quantity, marketValue, marketInputType, activeSideTab, setMarket]);

  const handleSubmit = async (side: 'BUY' | 'SELL') => {
    try {
      // Create payload using current synced context state
      const payload = {
        pair: market?.exchangePair?.replace('/', ''), 
        quantity: market?.quantity || 0,
        quoteOrderQty: market?.quoteOrderQty || 0,
        type: market?.orderType,
        order_price: market?.price || 0,
        side: side,
      };

      const response = await axios.post("http://localhost:8080/api/v1/order/create", payload, { withCredentials: true });
      
      if (response.data.ok) {
        toast.success(response.data.message);
      } else {
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.error("Execution failed. Please check your connection.");
    }
  };

  console.log(bots)
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">Snax Quantum</span>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row flex-1 p-3 gap-3 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-col flex-grow gap-3 min-w-0">
          <TradePage />

          {/* Table History & Active Bots Section */}
<div className="h-60 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
  {/* Tab Headers */}
  <div className="flex border-b border-gray-50 px-6 gap-8 shrink-0">
    {["history", "bots"].map((t) => (
      <button
        key={t}
        onClick={() => setActiveTab(t as Tab)}
        className={`py-4 text-[10px] uppercase tracking-widest border-b-2 transition-all ${
          activeTab === t ? "font-black border-black text-black" : "font-bold text-gray-300 border-transparent"
        }`}
      >
        {t}
      </button>
    ))}
  </div>

  <div className="flex-grow p-4 overflow-y-auto bg-[#FBFBFC]">
    {activeTab === "history" ? (
      /* --- STANDARD HISTORY TABLE --- */
      <table className="w-full text-left text-[11px]">
        <thead className="text-gray-400 uppercase">
          <tr>
            <th className="pb-3">Time</th>
            <th className="pb-3">Pair</th>
            <th className="pb-3">Side</th>
            <th className="pb-3">Price</th>
            <th className="pb-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {executionOrder.map((order, idx) => (
            <tr key={idx} className="border-b border-gray-50">
              <td className="py-2">{new Date(order.time).toLocaleTimeString()}</td>
              <td className="py-2 font-bold">{order.symbol}</td>
              <td className={`py-2 ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>{order.side}</td>
              <td className="py-2 font-mono">{order.price}</td>
              <td className="py-2 text-right uppercase font-black text-[9px]">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      /* --- ACTIVE BOTS CARD GRID (1/10 Split) --- */
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Example Active Bot Card */}
        {activeTab === "bots" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {bots.map((bot: any) => {
      // 1. Calculate PnL Logic
      // Assuming 'market.price' is the live price from your WebSocket/Context
      const entryPrice = bot.params?.bot_pod_spec?.entryPrice || 0;
      const currentPrice = market?.price || 0;
      
      const pnlValue = entryPrice > 0 
        ? ((currentPrice - entryPrice) / entryPrice) * 100 
        : 0;
      
      const isPositive = pnlValue >= 0;

      return (
        <div 
          key={bot.id || bot.exchangePair} // Always use a unique ID if available
          className="flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm h-28 group hover:border-black w-full transition-all"
        >
          {/* Left Side: 1/10 Brand/Status Strip */}
          <div className="w-[10%] bg-black flex flex-col items-center justify-center gap-2 py-2">
            <div className={`w-1 h-1 rounded-full animate-pulse ${bot.status === "running" ? "bg-green-500" : "bg-red-500"}`} />
            <span className="[writing-mode:vertical-lr] rotate-180 text-[8px] font-black text-white uppercase tracking-tighter">
              {bot.status === "running" ? "ACTIVE" : "STOPPED"}
            </span>
          </div>

          {/* Right Side: Bot Data */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[11px] font-black uppercase leading-tight">{bot?.exchangePair}</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase">{bot.startegy} V1</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{pnlValue.toFixed(2)}%
                </span>
                <p className="text-[8px] text-gray-300 font-bold uppercase">PnL (Unrealized)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-400 uppercase">Qty</span>
                <span className="text-[10px] font-bold font-mono truncate">
                  {bot.params?.bot_pod_spec?.quantity}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-400 uppercase">Timeframe</span>
                <span className="text-[10px] font-bold font-mono">
                  {bot.params?.bot_pod_spec?.timeFrame || '1h'}
                </span>
              </div>
              <div className="flex flex-col items-end justify-center">
                <button 
                  onClick={() => {/* Call your stop bot API */}}
                  className="text-[9px] font-black text-red-500 hover:scale-105 transition-transform uppercase"
                >
                  Stop Bot
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
      </div>
    )}
  </div>
</div>
        </div>

        {/* Trade Controls Sidebar */}
        <aside className="w-full lg:w-[400px] bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col shrink-0">
          <div className="p-4 flex gap-2 border-b border-gray-50">
            <button 
              onClick={() => setActiveSideTab('manual')} 
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${activeSideTab === 'manual' ? 'border-black bg-white shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'}`}
            >
              <Zap size={16} className="mb-1" />
              <span className="text-[10px] font-black uppercase">Manual Trade</span>
            </button>
            <button 
              onClick={() => setActiveSideTab('bot')} 
              className={`flex-1 flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${activeSideTab === 'bot' ? 'border-black bg-white shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'}`}
            >
              <LayoutGrid size={16} className="mb-1" />
              <span className="text-[10px] font-black uppercase">Trading Bot</span>
            </button>
          </div>

          <div className="p-6">
            {activeSideTab === 'manual' && (
              <div className="space-y-6">
                <div className="flex gap-4 border-b border-gray-50 text-xs font-bold pb-2">
                  <button onClick={() => setOrderMode('LIMIT')} className={`${orderMode === 'LIMIT' ? 'text-black border-b-2 border-black' : 'text-gray-300'} pb-2`}>Limit</button>
                  <button onClick={() => setOrderMode('MARKET')} className={`${orderMode === 'MARKET' ? 'text-black border-b-2 border-black' : 'text-gray-300'} pb-2`}>Market</button>
                </div>

                <div className="space-y-4">
                  {orderMode === 'LIMIT' ? (
                    <>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Price (USDT)</label>
                        <input type="number" value={limitPrice} onChange={(e) => setLimitPrice((e.target as HTMLInputElement as any).value)} className="w-full bg-transparent font-mono text-lg outline-none" placeholder="0.00" />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Quantity</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity((e.target as HTMLInputElement as any).value)} className="w-full bg-transparent font-mono text-lg outline-none" placeholder="0.00" />
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                          {marketInputType === 'amount' ? 'Amount' : 'Total (USDT)'}
                        </label>
                        <button 
                          onClick={() => setMarketInputType(marketInputType === 'amount' ? 'total' : 'amount')}
                          className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase"
                        >
                          <ArrowRightLeft size={10} /> Switch
                        </button>
                      </div>
                      <input 
                        type="number" 
                        value={marketInputType === 'amount' ? quantity : marketValue}
                        onChange={(e) => marketInputType === 'amount' ? setQuantity((e.target as HTMLInputElement as any).value) : setMarketValue((e.target as HTMLInputElement as any).value)}
                        placeholder="0.00"
                        className="w-full bg-transparent font-mono text-lg outline-none" 
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-green-500 hover:bg-green-600 h-14 rounded-2xl font-black text-white" onClick={() => handleSubmit("BUY")}>BUY</Button>
                    <Button className="flex-1 bg-red-500 hover:bg-red-600 h-14 rounded-2xl font-black text-white" onClick={() => handleSubmit("SELL")}>SELL</Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* BOT TRADING VIEW */}
            {activeSideTab === 'bot' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Strategy Selection Tabs */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <LayoutGrid size={32} className="text-black" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Select Bot Strategy</h3>
                    <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">
                      Quantum execution for {market?.exchangePair}
                    </p>
                  </div>

                  {/* Tabs with Sliding Content */}
                  <div className="bg-gray-50 p-1 rounded-2xl flex">
                    {['swing', 'grid', 'scalp'].map((strat) => (
                      <button
                        key={strat}
                        onClick={() => strat === 'swing' && setMarket((prev) => ({ ...prev, strategy: "SWING" }))}
                        className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${
                          strat === 'swing' 
                            ? 'bg-white shadow-sm text-black' 
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {strat} {strat !== 'swing' && " (Soon)"}
                      </button>
                    ))}
                  </div>

                  {/* Sliding Parameter Panel (Swing Only) */}
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                        <span className="text-[11px] font-black uppercase">Strategy Parameters</span>
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                      </div>
                      
                      {/* Active Input: Investment */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Investment Amount (USDT)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-mono text-lg outline-none focus:ring-2 focus:ring-black/5 transition-all"
                            placeholder="0.00"
                            onChange={(e) => setMarketValue((e.target as any).value)}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">USDT</span>
                        </div>
                      </div>

                      {/* Disabled/Coming Soon Inputs */}
                      <div className="grid grid-cols-2 gap-3 opacity-40">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Take Profit</label>
                          <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-400 italic">Coming Soon</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Stop Loss</label>
                          <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-400 italic">Coming Soon</div>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <label className="text-[9px] font-black text-gray-400 uppercase">Time Interval</label>
                          <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-400 italic">Coming Soon (1h Default)</div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={async () => {
                        try {
                          const payload = {
                            symbol: market?.exchangePair?.replace('/', ''),
                            strategy: "SWING",
                            amount: Number(marketValue),
                            user_id: user?._id
                          };
                          const res = await axios.post("http://localhost:8080/api/v1/bot/launch", payload);
                          if (res.data.ok) toast.success("Swing Bot Launched!");
                        } catch (e) {
                          toast.error("Launch failed. Check balance.");
                        }
                      }}
                      className="w-full bg-black h-16 rounded-2xl font-black text-white uppercase tracking-widest text-[11px] hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-black/10"
                    >
                      Launch Automated Bot
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}