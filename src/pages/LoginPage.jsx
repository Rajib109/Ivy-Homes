import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNTS, DEFAULT_PASSWORD } from "../services/api";
import { Building2, KeyRound, Mail, Lock, ShieldCheck, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export const LoginPage = ({ onSuccess }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("demo1@ivy.homes");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to log in. Please check credentials.");
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEFAULT_PASSWORD);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-slate-800 bg-[#0f172a]/90 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Ivy Homes Portal</h1>
          <p className="text-xs text-slate-400">Authenticate with API credentials to access property listings</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                placeholder="demo1@ivy.homes"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 hover:brightness-110 transition flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to API</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Quick Pickers */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Quick Select Demo Account:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc, idx) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                  email === acc.email
                    ? "bg-sky-500/20 border-sky-500 text-sky-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                Demo {idx + 1}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Key: <code className="font-mono text-sky-400">{import.meta.env.VITE_API_KEY || "Configured via .env"}</code>
          </p>
        </div>

      </div>
    </div>
  );
};
