"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Bot, Terminal, Cpu, Box, 
  GitBranch, ArrowRight, Code2, 
  Command, Activity, Shield
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [terminalLine, setTerminalLine] = useState<string>("> Initializing snax_core...");

  useEffect(() => {
    const access = Cookies.get('access_token');
    const refresh = Cookies.get('refresh_token');
    setIsAuthenticated(!!(access && refresh));

    // Simple terminal animation effect
    const lines = [
      "> Loading neural weights...",
      "> Connecting to decentralized mesh...",
      "> Auth Layer: Standing by.",
      "> System status: 100% Operational."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTerminalLine(lines[i]);
      i = (i + 1) % lines.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans">
      
      {/* --- Minimalist Nav --- */}
      <nav className="flex items-center justify-between px-8 py-6 sticky top-0 bg-white/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white shadow-xl">
            <Bot size={20} />
          </div>
          <span className="font-black tracking-tighter text-xl">AUTOMA</span>
        </div>

        <div className="hidden lg:flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          <button onClick={() => router.push('#engine')} className="hover:text-black transition-all">Engine</button>
          <button onClick={() => router.push('#docs')} className="hover:text-black transition-all">Documentation</button>
          {isAuthenticated && (
            <button onClick={() => router.push('/v1/trade')} className="text-black border-b-2 border-black">Trade_Interface</button>
          )}
        </div>

        <div className="flex gap-4">
          {isAuthenticated ? (
            <button 
              onClick={() => router.push('/v1/dashboard')}
              className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold shadow-[0_10px_20px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all"
            >
              DASHBOARD
            </button>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="text-xs font-bold uppercase tracking-widest">Login</button>
              <button 
                onClick={() => router.push('/signup')}
                className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold"
              >
                JOIN
              </button>
            </>
          )}
        </div>
      </nav>

      {/* --- Hero: The Interactive Interface --- */}
      <header className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-black tracking-[0.2em] uppercase bg-gray-100 rounded-md border border-gray-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Open Source
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
            AGENTIC <br/> 
            <span className="text-transparent" style={{ WebkitTextStroke: '1px #1A1A1A' }}>SYSTEMS</span>
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-md leading-relaxed font-medium">
            Building a collaborative infrastructure for autonomous trading entities. No gatekeepers. Just pure logic.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push(isAuthenticated ? '/v1/trade' : '/signup')}
              className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
            >
              Initialize Node <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* --- Interactive Terminal Widget --- */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-gray-200 to-transparent rounded-[2.5rem] blur-2xl opacity-50" />
          <div className="relative bg-[#0D0D0D] rounded-[2rem] p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
            </div>
            <div className="font-mono text-sm space-y-3">
              <p className="text-gray-500">snax-07@os:~$ <span className="text-white">git clone automa</span></p>
              <p className="text-lime-400">Receiving objects: 100% (452/452), done.</p>
              <p className="text-gray-500">snax-07@os:~$ <span className="text-white">npm run dev</span></p>
              <p className="text-blue-400 animate-pulse">{terminalLine}</p>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <span>Latency: 0.12ms</span>
                <span>Uptime: 99.99%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Engine/Architecture (Deep & Professional) --- */}
      <section id="engine" className="bg-black text-white py-32 px-8 rounded-[4rem] mx-4 mb-20 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Command className="text-white" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter">Event-Driven Core</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Our backbone uses a non-blocking I/O architecture. Every market movement triggers a cascading series of autonomous decisions across your agent mesh.</p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Shield className="text-white" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter">Encrypted State</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Private keys never leave your local environment. We utilize OAUTH2-Radius for session management with automated refresh token rotation.</p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Activity className="text-white" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter">Real-time Sync</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Leveraging WebSocket clusters to maintain a persistent link between the engine and the dashboard. Zero-refresh interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Open Source Contribution Section --- */}
      <section id="docs" className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl font-black mb-12 tracking-tighter uppercase">The Documentation Library</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 border border-gray-100 rounded-3xl text-left hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <Code2 className="text-black" size={32} />
              <GitBranch className="text-gray-200 group-hover:text-black transition-colors" />
            </div>
            <h4 className="font-black text-lg mb-2">Build a Custom Agent</h4>
            <p className="text-gray-400 text-sm">Learn how to extend the BaseAgent class to create your own logic. Documentation for Python and TypeScript SDKs available.</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-3xl text-left hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <Box className="text-black" size={32} />
              <Cpu className="text-gray-200 group-hover:text-black transition-colors" />
            </div>
            <h4 className="font-black text-lg mb-2">Self-Hosted Deployment</h4>
            <p className="text-gray-400 text-sm">Step-by-step guide to deploying the SNAX stack on your own AWS/GCP infrastructure using our Docker templates.</p>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-black">
             <Bot size={24} /> SNAX SYSTEM
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <a href="https://github.com/snax-07" className="hover:text-black transition-all">Github</a>
            <a href="#" className="hover:text-black transition-all">Documentation</a>
            <a href="#" className="hover:text-black transition-all">License</a>
          </div>
          <p className="text-gray-300 text-[10px] font-bold">RELEASE 2025 // VERSION 1.0.4_BETA</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;