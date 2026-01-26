import { cookies } from 'next/headers';
import { Navbar } from '@/components/Navbar';
import { ArrowRight, MousePointer2, Cpu, Check, Heart, Github, Terminal } from 'lucide-react';

export default async function LandingPage() {
  // SERVER SIDE COOKIE CHECK
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 antialiased">
      <Navbar isLoggedIn={isLoggedIn} />

      {/* HERO */}
      <section className="pt-44 pb-24 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Free & Open-Source Terminal
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
          The professional bridge to <br /> <span className="text-slate-400">digital asset markets.</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
          One interface. Multiple exchanges. Zero latency. 
          Manage your manual trades or deploy autonomous bots without overhead.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg shadow-slate-200 flex items-center gap-2">
            Open Terminal <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
          <MousePointer2 className="mb-6 text-slate-900" />
          <h3 className="text-2xl font-bold mb-4 text-slate-900">Manual Edge</h3>
          <p className="text-slate-500 mb-6">Execution speed matters. Our terminal provides institutional-grade hotkeys and visual order management.</p>
          <div className="flex flex-wrap gap-3">
             {['Multi-Exchange', 'Hotkeys', 'Live Books'].map(f => (
               <span key={f} className="text-[10px] font-bold uppercase px-3 py-1 bg-slate-50 rounded-full border border-slate-100">{f}</span>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem]">
          <Cpu className="mb-6 text-white" />
          <h3 className="text-2xl font-bold mb-4">Auto-Pilot</h3>
          <p className="text-slate-400 mb-6">Run TradingView webhooks or custom algorithms 24/7 on our low-latency cloud infrastructure.</p>
          <div className="flex flex-wrap gap-3">
             {['Webhooks', '24/7 Uptime', 'Risk Guard'].map(f => (
               <span key={f} className="text-[10px] font-bold uppercase px-3 py-1 bg-white/10 rounded-full border border-white/5">{f}</span>
             ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <div className="grid md:grid-cols-3 gap-12 border-t border-slate-200 pt-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className="bg-slate-900 p-1 rounded-md text-white"><Terminal size={14} /></div>
               <span className="font-bold">Snax Quantum</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs uppercase font-medium">
              Free, Open-Source, and Anonymous. Built for the modern trader.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Connect</h4>
            <a href="https://github.com/snax-07/" className="text-sm font-medium flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <Github size={16} /> GitHub Source
            </a>
            <a href="/dev" className="text-sm font-medium flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <Heart size={16} className="text-blue-500 fill-blue-500" /> Support Project
            </a>
          </div>
          
          <div className="text-right text-[10px] text-slate-300 self-end">
            © 2026 Snax Quantum — v1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}