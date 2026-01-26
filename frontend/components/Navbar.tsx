"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, LayoutDashboard, LogOut, Terminal, ChevronDown, 
  ArrowRight, Github, Heart 
} from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  isLoggedIn: boolean;
  userName?: string;
}

export const Navbar = ({ isLoggedIn, userName = "Operator" }: NavbarProps) => {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success("Session Terminated");
        // We let the middleware or a page refresh handle the redirect
       router.replace('/dashboard') // Only place window is acceptable, for a hard reset
      }
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-xl border border-slate-200/60 px-6 py-3 rounded-2xl shadow-sm">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-slate-900 p-1.5 rounded-lg text-white">
            <Terminal size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">Snax Quantum</span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button 
              onClick={() => router.push('/login')}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
            >
              Get Started
            </button>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
              >
                <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px]">
                  {userName.charAt(0)}
                </div>
                <ChevronDown size={14} className={showProfile ? 'rotate-180' : ''} />
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 p-2 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator</p>
                    <p className="text-sm font-semibold truncate">{userName}</p>
                  </div>
                  <button 
                    onClick={() => router.push('/v1/dashboard')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};