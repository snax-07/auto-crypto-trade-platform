"use client";
import React from 'react';
import { 
  Terminal, ShieldAlert, Cpu, Code2, 
  GitBranch, Key, BookOpen, ExternalLink,
  ChevronRight, AlertCircle, Github
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pt-28 pb-20 px-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <Code2 size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Contributor Protocol</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">SNAX QUANTUM</h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Building the next-generation unified execution layer for digital assets.
          </p>
        </header>

        {/* --- CRITICAL WARNING BANNER --- */}
        <section className="mb-12 bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex gap-5 items-start">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-700 shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-lg mb-1">Architectural Prototype Only</h3>
            <p className="text-amber-800/80 text-sm leading-relaxed">
              This system is currently in the **System Understanding Phase**. It is strictly designed for prototyping logic flows. 
              <span className="block mt-2 font-bold underline">USE ONLY TESTNET / SANDBOX KEYS. Never input production API credentials into this build.</span>
            </p>
          </div>
        </section>

        {/* --- CORE PILLARS --- */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <DocCard 
            icon={<Cpu size={20}/>} 
            title="Non-Blocking UI" 
            desc="Every state update must be optimistic. Use local state first, sync to MongoDB in the background."
          />
          <DocCard 
            icon={<Key size={20}/>} 
            title="Secure Vaulting" 
            desc="Credentials must be encrypted at rest using AES-256-GCM before database insertion."
          />
        </div>

        {/* --- INSTRUCTIONS SECTION --- */}
        <section className="space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Terminal size={22} className="text-slate-400"/> 01. Local Development
            </h2>
            <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-sm space-y-2 overflow-x-auto shadow-2xl">
              <p className="text-slate-500"># Clone and install</p>
              <p>git clone https://github.com/snax-07/auto-crypto-trade-platform.git</p>
              <p>npm install</p>
              <p className="pt-4 text-slate-500"># Environment setup (Required)</p>
              <p>MONGODB_URI="mongodb://localhost:27017/snax"</p>
              <p>BCRYPT_SALT="12"</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <GitBranch size={22} className="text-slate-400"/> 02. Feature Implementation
            </h2>
            <div className="space-y-4">
              <StepRow number="1" text="Verify all API logic with Binance Testnet or ByBit Demo." />
              <StepRow number="2" text="Ensure the not to include the real api keys" />
              <StepRow number="3" text="Please find mistake so i can learn more." />
            </div>
          </div>
        </section>

        {/* --- FOOTER ACTION --- */}
        <footer className="mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href="https://github.com/snax-07/auto-crypto-trade-platform.git" className="flex items-center gap-2 text-sm font-bold hover:text-blue-600 transition-colors">
              <Github size={18}/> Repository
            </a>
            <a href="https://github.com/snax-07/auto-crypto-trade-platform/tree/main/docs" className="flex items-center gap-2 text-sm font-bold hover:text-blue-600 transition-colors">
              <BookOpen size={18}/> Full API Docs
            </a>
          </div>
          <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all">
            Join Development <ExternalLink size={16}/>
          </button>
        </footer>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const DocCard = ({ icon, title, desc }: any) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all">
    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-5 text-slate-900">
      {icon}
    </div>
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepRow = ({ number, text }: any) => (
  <div className="flex gap-4 items-center group">
    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
      {number}
    </div>
    <p className="text-sm font-medium text-slate-600">{text}</p>
  </div>
);


export default LandingPage;