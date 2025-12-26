"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, TrendingUp, BarChart3, History, ChevronRight, LayoutGrid, Zap, AlertTriangle, Info, Clock, ArrowRightLeft, AwardIcon } from 'lucide-react';
import TradePage from '@/components/tradingCharts/tradingCharts';
import { toast } from 'sonner';
import { MarketData, MarketProvider, useTrade } from '@/hooks/useTrade';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';



      import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/*--------Types-------*/
type TradeType = 'manual' | 'bot';
type OrderMode = 'LIMIT' | 'MARKET'; // Capitalized to match API standards
type StrategyType = 'swing' | 'grid' | 'martingale' | 'arbitrage';
type MarketInputType = 'amount' | 'total';
type Tab = "history" | "bots";

interface BotField {
  id: string;
  label: string;
  val: string;
}

interface Bots {
  k8sPodName : string;
  name : string;
  status : string;
  pair : string;
  strategy : string;
}

export default function Trading() {
  /*---------------States-----------------*/
  const [activeSideTab, setActiveSideTab] = useState<TradeType>('manual');
  const [orderMode, setOrderMode] = useState<OrderMode>('LIMIT');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('swing');
  
  // Local states for UI inputs before context sync
  const [limitPrice, setLimitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [marketValue, setMarketValue] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("history");
  const { market, setMarket , executionOrder } = useTrade(); 
  const {user} = useAuth();
  const [isDigOpen , setIsDigOpen] = useState(false);
  const [isBotLaunching , setIsBotLaunching] = useState(false);
  const [bots, setBots] = useState<Bots[]>([]);

  const botQuantity = useRef<HTMLInputElement | null>(null)
  const [marketInputType, setMarketInputType] = useState<MarketInputType>('amount');
  const [botFields, setBotFields] = useState<BotField[]>([
    { id: '1', label: 'Investment Amount', val: '0' }
  ]);

  const strategies = [
    { id: 'swing', name: 'Swing Bot' },
    { id: 'grid', name: 'Grid Trading' },
    { id: 'martingale', name: 'Martingale' },
    { id: 'arbitrage', name: 'Arbitrage' },
  ];

  /*---------------Context Sync Logic-----------------*/
  // 1. Sync Manual Trade Details to Context
 useEffect(() => {
    if (activeSideTab === 'manual') {
      setMarket((prev: MarketData) => {
        // Ensure we return a complete MarketData object
        return {
          ...prev,
          orderType: orderMode,
          // If MarketData requires a number, use 0 or current market price for MARKET orders
          price: orderMode === 'LIMIT' ? Number(limitPrice) : 0, 
          quantity: marketInputType === 'amount' ? Number(quantity || marketValue) : 0,
          quoteOrderQty: marketInputType === 'total' ? Number(marketValue) : 0,
          strategy: "MANUAL"
        };
      });
    }

   const allBots = async () => {
     try {
      
      const response = await axios.get("http://localhost:8080/api/v1/bot/getBots" , {withCredentials : true});
      if(!response.data.ok) {
        toast.info(response.data.message)
        return
      }

      setBots(response.data.bots);

    } catch (error) {
      toast.error("Bot fetching error !!")
    }
   }

   allBots()
   console.log("BOTS :: ", bots)
  }, [orderMode, limitPrice, quantity, marketValue, marketInputType, activeSideTab, setMarket]);

  // 2. Sync Bot Strategy to Context
  useEffect(() => {
    if (activeSideTab === 'bot') {
      setMarket((prev) => ({
        ...prev,
        strategy: selectedStrategy.toUpperCase(),
        orderType: "BOT_EXECUTION"
      }));
    }
  }, [activeSideTab, selectedStrategy, setMarket]);

  /*---------------Handlers-----------------*/
  const addField = () => {
    setBotFields([...botFields, { id: Date.now().toString(), label: 'Take Profit %', val: '5.0' }]);
  };

const handleSubmit = async (side: 'BUY' | 'SELL') => {
  try {
    const response = await axios.post("http://localhost:8080/api/v1/order/create", {
      pair: market?.exchangePair,
      quantity: parseFloat(quantity), // Ensure number
      quoteOrderQty: parseFloat(marketValue) || 0,
      type: market?.orderType,
      order_price: parseFloat(limitPrice), // Rename to match Go struct 'order_price'
      side: side,
    }, { withCredentials: true })
    
    if (!response.data.ok) {
      toast.info(response.data.message);
      return;
    }
    toast.success(response.data.message);
  } catch (error) {
    toast.error("Internal error");
  }
}


const LaunchBot = async ()=> {
  try {

    // THIS WILL USED FOR VERIFYING THE USER AND MKAING SURE THAT THEY HAVE COMPLETED THE KYC VERIFICATION 
    // if(!user?.isPanVerified){
    //     setIsDigOpen(true);
    //     return
    // }
    setIsBotLaunching(true);
    
    const payload = {
      exchangePair : market?.exchangePair,
      strategy : selectedStrategy,
      quantity : (botQuantity.current as any)?.value,
      timeFrame : market?.interval
    }

    console.log(payload)

    const resp = await axios.post("http://localhost:8080/api/v1/bot/create" , payload , {withCredentials : true});
    if(!resp.data.ok){
      toast.info(resp.data.message);
      setIsBotLaunching(false);
    }

    toast.success(resp.data.message);
  } catch (error) {
    toast.error("Internal error !!!")
  }
}

const handleStopBot = async (id : string)=> {

}

console.log(bots)
  return (
       <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans">
      
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

      <main className="flex flex-col lg:flex-row flex-1 p-3 gap-3 overflow-hidden">
        
        <div className="flex flex-col flex-grow gap-3 min-w-0">
          <TradePage />

          <div className="h-60 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
  {/* Tabs Header */}
  <div className="flex border-b border-gray-50 px-6 gap-8">
    <button
      onClick={() => setActiveTab("history")}
      className={`py-4 text-[10px] uppercase tracking-widest border-b-2 transition-all ${
        activeTab === "history"
          ? "font-black border-black text-black"
          : "font-bold text-gray-300 border-transparent"
      }`}
    >
      History
    </button>

    <button
      onClick={() => setActiveTab("bots")}
      className={`py-4 text-[10px] uppercase tracking-widest border-b-2 transition-all ${
        activeTab === "bots"
          ? "font-black border-black text-black"
          : "font-bold text-gray-300 border-transparent"
      }`}
    >
      My Bots
    </button>
  </div>

  <div className="flex-grow p-4 overflow-y-auto">
    <table className="w-full text-left text-[11px]">
      <thead className="text-gray-400 uppercase">
        {activeTab === "history" ? (
          <tr>
            <th className="pb-3">Time</th>
            <th className="pb-3">Pair</th>
            <th className="pb-3">Side</th>
            <th className="pb-3">Total</th>
            <th className="pb-3">Status</th>
          </tr>
        ) : (
          <tr>
            <th className="pb-3">Bot Name</th>
            <th className="pb-3">Strategy</th>
            <th className="pb-3">Status</th>
            <th className="pb-3 text-right">Action</th>
          </tr>
        )}
      </thead>

      <tbody className="text-gray-600 font-medium text-[10px]">
        {activeTab === "history" ? (
          // --- HISTORY TAB CONTENT ---
          executionOrder.filter(o => o.status !== "OPEN").length > 0 ? (
            executionOrder.filter(o => o.status !== "OPEN").map((order, i) => (
              <tr key={order._id || i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-mono text-gray-400">{new Date(order.time).toLocaleDateString()}</td>
                <td className="py-3 font-black text-black">{order.symbol || "BTCUSDT"}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-md font-black uppercase text-[9px] ${order.side === "BUY" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {order.side || "BUY"}
                  </span>
                </td>
                <td className="py-3 font-mono text-black">{order.total ? `${Number(order.total).toFixed(2)} USDT` : "-"}</td>
                <td className="py-3 font-mono text-black">{order.status || "-"}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5} className="py-10 text-center text-gray-300 uppercase">No history</td></tr>
          )
        ) : (
          // --- BOTS TAB CONTENT ---
          bots.length > 0 ? (
            bots.map((bot) => (
              <tr key={bot.k8sPodName} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 font-black text-black uppercase">{`${bot.name.split(" ")[0].substring(0 ,4)}-${bot.pair}`}</td>
                <td className="py-3 font-mono text-gray-400">{bot.strategy}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                    bot.status === "RUNNING" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {bot.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {bot.status === "RUNNING" ? (
                    <button
                      onClick={() => handleStopBot(bot.k8sPodName)}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded-md font-black text-[9px] hover:bg-red-600 hover:text-white transition-all uppercase"
                    >
                      Stop Bot
                    </button>
                  ) : (
                    <span className="text-gray-300 italic pr-3 text-[9px]">{bot.status}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className="py-10 text-center text-gray-300 uppercase">No bots found</td></tr>
          )
        )}
      </tbody>
    </table>
  </div>
</div>
        </div>

        <aside className="w-full lg:w-[400px] bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col shrink-0 overflow-y-auto">
          
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

          <div className="p-6">
            {activeSideTab === 'manual' ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex gap-4 border-b border-gray-50 text-xs font-bold pb-2">
                  <button onClick={() => setOrderMode('LIMIT')} className={`${orderMode === 'LIMIT' ? 'text-black border-b-2 border-black' : 'text-gray-300'} pb-2`}>Limit</button>
                  <button onClick={() => setOrderMode('MARKET')} className={`${orderMode === 'MARKET' ? 'text-black border-b-2 border-black' : 'text-gray-300'} pb-2`}>Market</button>
                </div>

                <div className="space-y-4">
                  {orderMode === 'LIMIT' ? (
                    <>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Price (USDT)</label>
                        <input 
                          type="text" 
                          value={limitPrice} 
                          onChange={(e) => setLimitPrice((e.target as HTMLInputElement as any).value)}
                          className="w-full bg-transparent font-mono text-lg outline-none" 
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Quantity ({symbol.split('/')[0]})</label>
                        <input 
                          type="text" 
                          value={quantity}
                          onChange={(e) => setQuantity((e.target as HTMLInputElement as any).value)}
                          placeholder="0.00" 
                          className="w-full bg-transparent font-mono text-lg outline-none" 
                        />
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                          {marketInputType === 'amount' ? `Amount (${symbol.split('/')[0]})` : 'Total (USDT)'}
                        </label>
                        <button 
                          onClick={() => setMarketInputType(marketInputType === 'amount' ? 'total' : 'amount')}
                          className="flex items-center gap-1 text-[9px] font-bold text-blue-500 hover:text-blue-700 uppercase"
                        >
                          <ArrowRightLeft size={10} /> Switch to {marketInputType === 'amount' ? 'Total' : 'Amount'}
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={marketValue}
                        onChange={(e) => setMarketValue((e.target as HTMLInputElement as any).value)}
                        placeholder={marketInputType === 'amount' ? '0.00' : 'Enter Total USDT'} 
                        className="w-full bg-transparent font-mono text-lg outline-none" 
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map(p => (
                      <button key={p} className="flex-1 py-1.5 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 hover:border-black hover:text-black transition-all">{p}%</button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                        className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:brightness-110" 
                        onClick={() => handleSubmit("BUY")}
                    >
                        Buy {symbol.split('/')[0]}
                    </button>
                    <button 
                        className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:brightness-110" 
                        onClick={() => handleSubmit("SELL")}
                    >
                        Sell {symbol.split('/')[0]}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {strategies.map((strat) => (
                    <button
                      key={strat.id}
                      onClick={() => setSelectedStrategy(strat.id as StrategyType)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all border ${selectedStrategy === strat.id ? 'bg-black text-white' : 'bg-white text-gray-400'}`}
                    >
                      {strat.name}
                    </button>
                  ))}
                </div>

                <div className="relative min-h-[300px]">
                  {selectedStrategy !== 'swing' && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100">
                      <Clock className="text-gray-300 mb-2" size={32} />
                      <h4 className="font-black text-gray-800 uppercase text-xs">Coming Soon</h4>
                    </div>
                  )}

                  <div className={`space-y-6 ${selectedStrategy !== 'swing' ? 'opacity-20 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Parameters</h3>
                      <button onClick={addField} className="p-1.5 bg-gray-100 rounded-lg hover:bg-black hover:text-white"><Plus size={16} /></button>
                    </div>

                    {botFields.map((field) => (
                      <div key={field.id} className="bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-black group">
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">{field.label}</label>
                        <div className="flex justify-between">
                          <input type="text" defaultValue={field.val} ref={botQuantity} className="bg-transparent font-mono text-sm outline-none w-full" />
                          <button onClick={() => setBotFields(botFields.filter(f => f.id !== field.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-3 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase"><Info size={14} /> Bot Configuration</div>
                      <div className="grid grid-cols-2 gap-4 text-[10px]">
                        <div><span className="text-gray-400 block uppercase font-black text-[8px]">Order Type</span><span className="font-bold">Market</span></div>
                        <div><span className="text-gray-400 block uppercase font-black text-[8px]">Timeframe</span><span className="font-bold">1H</span></div>
                      </div>
                      <div className="flex items-start gap-2 pt-2 border-t border-blue-100/30">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                        <p className="text-[9px] text-gray-500">Note: Stopping the bot executes a <span className="font-bold text-red-500 underline">Market Sell</span> for all active positions.</p>
                      </div>
                    </div>

                    <button onClick={LaunchBot} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl">Launch Strategy</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

    <Dialog open={isDigOpen} onOpenChange={setIsDigOpen}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>KYC</DialogTitle>
          </DialogHeader>
            <p>You must finish verification before launching the bot!</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes(TEMP)</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>


    </div>
  );
}