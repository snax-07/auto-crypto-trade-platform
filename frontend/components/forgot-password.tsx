// ResetPasswordForm.tsx
"use html";

import React, { useState } from "react";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans antialiased selection:bg-white selection:text-black">
      <div className="w-full max-w-md p-8 border border-zinc-800 bg-zinc-950 rounded-none shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center px-3 py-1 border border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-400 mb-2">
            Snax Quantum Org
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white uppercase">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-400 tracking-wide">
            {!isSubmitted 
              ? "Enter your credentials to receive a recovery link." 
              : "Check your authentication portal."}
          </p>
        </div>

        {/* Form Content */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-xs uppercase tracking-widest text-zinc-400 font-medium"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-4 py-3 bg-black border border-zinc-850 rounded-none text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors duration-200 uppercase tracking-wider text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white text-black hover:bg-zinc-200 font-medium text-xs uppercase tracking-widest transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          /* Success State */
          <div className="space-y-6 text-center animate-fade-in">
            <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs tracking-wide uppercase">
              An encryption link has been transmitted to <span className="text-white font-mono lowercase">{email}</span> if the account exists.
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-3 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-white font-medium text-xs uppercase tracking-widest transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Footer Accent */}
        <div className="pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 tracking-wider uppercase">
          <span>Secured Terminal</span>
          <span>©2026 SQO</span>
        </div>
      </div>
    </div>
  );
}