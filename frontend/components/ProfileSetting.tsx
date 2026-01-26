"use client"

import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, ArrowRight, RefreshCcw, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Before } from 'v8';
import { email } from 'zod';
import { useRouter } from 'next/navigation';

// Assuming InputWrapper is defined elsewhere in your project
const InputWrapper = ({ label, icon, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input 
        {...props} 
        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-slate-900 outline-none transition-all" 
        onChange={(e) => props.onChange((e.target as HTMLInputElement as any).value)}
      />
    </div>
  </div>
);

export const ProfileSettings = () => {
  const { user, setUser } = useAuth(); // From your Auth Context
  const [loading, setLoading] = useState(false);
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [otp, setOtp] = useState("");

  const router = useRouter()
  
  const [profile, setProfile] = useState({ 
    fullName:  "", 
    email:  "", 
    confirmPass: "" 
  });


useEffect(() => {
    // Access the global scope through 'window' in browser environments
    const runtime = typeof window !== "undefined" ? window : null;

    if (showOtpOverlay && runtime) {
      const handleUnload = (event: Event) => {
        event.preventDefault();
        // Use type casting to set the returnValue without needing a specific Type
        (event as any).returnValue = true; 
        return true;
      };

      runtime.addEventListener("beforeunload", handleUnload);

      return () => {
        runtime.removeEventListener("beforeunload", handleUnload);
      };
    }
  }, [showOtpOverlay]);

  const handleStartUpdate = async () => {
    if (!profile.confirmPass) return toast.error("Password required to authorize changes");
    
    setLoading(true);
    try {
      // Step 1: Tell backend to send OTP
      const res = await axios.post("http://localhost:8080/api/v1/auth/update-request", {} ,{withCredentials : true});
      if (res.data.ok) {
        setShowOtpOverlay(true);
        toast.success("Verification code sent");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Auth Error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = async () => {
    setLoading(true);
    try {
      // Step 2: Finalize the DB update
      const res = await axios.post("http://localhost:8080/api/v1/auth/verify-update", { otp , name : profile.fullName , email : profile.email } , {withCredentials :true});
      if (res.data.ok) {
        setUser(res.data.user); // Update context
        setShowOtpOverlay(false);
        setProfile(prev => ({ ...prev, confirmPass: "" }));
        toast.success("Profile Securely Updated");
        router.replace("/dashboard")
      }
    } catch (err) {
      console.log(err)
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* MAIN PROFILE FORM */}
      <div className={`space-y-8 transition-all duration-500 ${showOtpOverlay ? 'blur-md opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <header className="border-b border-slate-100 pb-6">
          <h1 className="text-xl font-bold tracking-tight">Account Personalization</h1>
          <p className="text-slate-400 text-xs">Manage your Snax Quantum identity and secure communication.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWrapper label="Full Name" value={profile.fullName} onChange={(v: any) => setProfile({...profile, fullName: v})} icon={<User size={16}/>} />
          <InputWrapper label="Email Address" value={profile.email} onChange={(v: any) => setProfile({...profile, email: v})} icon={<Mail size={16}/>} />
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-slate-900 mb-4 font-bold text-[10px] uppercase tracking-tighter">
            <ShieldCheck size={16} className="text-blue-500" /> Identity Confirmation Required
          </div>
          <InputWrapper 
            label="Verify Current Password" 
            type="password" 
            placeholder="••••••••" 
            value={profile.confirmPass} 
            onChange={(v: any) => setProfile({...profile, confirmPass: v})} 
          />
        </div>

        <button 
          onClick={handleStartUpdate}
          disabled={loading}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all ml-auto block shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "Update Profile"}
        </button>
      </div>

      {/* OTP OVERLAY - Appears inside the child container */}
      {showOtpOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <Lock size={20} />
              </div>
              <h3 className="font-bold text-lg">Enter 2FA Code</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 mb-6">Sent to your inbox</p>
              
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp((e.target as HTMLInputElement as any).value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xl font-mono tracking-[0.4em] mb-4 focus:border-slate-900 outline-none"
              />

              <button 
                onClick={handleFinalVerify}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all mb-3"
              >
                Confirm Update
              </button>
              <button 
                onClick={() => setShowOtpOverlay(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};