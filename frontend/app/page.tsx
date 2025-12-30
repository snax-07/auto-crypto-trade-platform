"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Bot, ShieldCheck, Zap, BarChart3, 
  Check, ArrowRight, User, Lock, 
  MessageSquare, Globe 
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const access = Cookies.get('access_token');
    const refresh = Cookies.get('refresh_token');
    setIsAuthenticated(!!(access && refresh));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-lime-300">
      
      {/* --- Navigation --- */}
      <nav className="flex items-center justify-between px-10 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => router.push('/')}>
          <Bot className="w-8 h-8" /> <span>SNAX</span>
        </div>
        
        <div className="hidden lg:flex gap-8 text-sm font-semibold text-gray-500">
          <button onClick={() => router.push('#features')} className="hover:text-black">Products</button>
          <button onClick={() => router.push('#how-it-works')} className="hover:text-black">Pricing</button>
          <button onClick={() => router.push('#team')} className="hover:text-black">Resources</button>
          {isAuthenticated && (
            <button onClick={() => router.push('/v1/trade')} className="text-black border-b-2 border-lime-400">Trade</button>
          )}
        </div>

        <div className="flex gap-4">
          {isAuthenticated ? (
            <button 
              onClick={() => router.push('/v1/dashboard')}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-sm font-bold shadow-lg hover:bg-gray-800 transition-all"
            >
              <User size={16} /> PROFILE
            </button>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="text-sm font-bold px-4">Login</button>
              <button onClick={() => router.push('/signup')} className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold">Join Now</button>
            </>
          )}
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
        <div className="flex justify-center mb-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
             <Bot size={56} className="text-black" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Automate Your Trading With Smart <br/> Crypto Bots
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Snax provides a decentralized ecosystem for autonomous agents. Simple to set up, impossible to ignore.
        </p>
        <button 
          onClick={() => router.push(isAuthenticated ? '/v1/trade' : '/signup')}
          className="bg-lime-400 text-black px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          Get Started <ArrowRight size={20} />
        </button>
        
        {/* Partner Logos */}
        <div className="mt-20 flex flex-wrap justify-center gap-10 grayscale opacity-40">
           <span className="font-bold text-xl uppercase tracking-widest">Bloomberg</span>
           <span className="font-bold text-xl uppercase tracking-widest">Forbes</span>
           <span className="font-bold text-xl uppercase tracking-widest">Crunchbase</span>
           <span className="font-bold text-xl uppercase tracking-widest">TechCrunch</span>
        </div>
      </header>

      {/* --- Feature Grid (As seen in image) --- */}
      <section id="features" className="max-w-7xl mx-auto px-10 py-24 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-20 italic">Alpha Moves Fast. Gets More Faster.</h2>
        <div className="grid md:grid-cols-2 gap-8">
           <FeatureCard title="Autonomous Engine" desc="React to market moves in real-time." icon={<Zap className="text-purple-500" />} />
           <FeatureCard title="Deep Analytics" desc="Full breakdown of every agent action." icon={<BarChart3 className="text-orange-500" />} />
           <FeatureCard title="Global Deployment" desc="12 regions for lowest latency." icon={<Globe className="text-blue-500" />} />
           <FeatureCard title="Vault Protection" desc="Keys encrypted with AES-256." icon={<Lock className="text-lime-500" />} />
        </div>
      </section>

      {/* --- Testimonial Section --- */}
      <section className="bg-gray-50 py-24 px-10 border-y border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Testimonials From Trustpilot</h2>
          <div className="flex justify-center gap-4 mb-10">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-16 h-16 rounded-full bg-gray-200 border-4 border-white overflow-hidden shadow-sm">
                 <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
               </div>
             ))}
          </div>
          <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl">
             <p className="text-xl italic leading-relaxed">
               "The SNAX platform changed how I think about automation. I no longer spend 8 hours a day staring at charts. The bots do the heavy lifting while I focus on strategy."
             </p>
             <div className="mt-6 font-bold text-lime-400">@david_trades</div>
          </div>
        </div>
      </section>

      {/* --- Footer / Start Card --- */}
      <section className="py-32 px-10 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-black mb-8">Getting Started Is Easy!</h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <input type="email" placeholder="Enter your email" className="px-8 py-4 bg-gray-100 rounded-2xl w-full md:w-80 outline-none focus:ring-2 ring-lime-400" />
          <button className="bg-lime-400 text-black px-10 py-4 rounded-2xl font-bold">Go Now</button>
        </div>
      </section>

      <footer className="py-20 bg-white flex flex-col items-center border-t border-gray-50">
        <div className="flex gap-10 mb-10 text-gray-400 text-xs font-bold uppercase tracking-widest">
           <a href="#">Products</a><a href="#">Security</a><a href="#">Github</a><a href="#">Help</a>
        </div>
        <Bot size={32} className="text-lime-500 mb-4 opacity-50" />
        <p className="text-gray-300 text-[10px] font-bold tracking-[0.4em] uppercase">SNAX // OS // 2025</p>
      </footer>

    </div>
  );
};

// Helper Components
const FeatureCard = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
  <div className="p-10 border border-gray-100 rounded-[2.5rem] bg-white hover:shadow-2xl transition-all duration-500 group">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </div>
);

export default LandingPage;