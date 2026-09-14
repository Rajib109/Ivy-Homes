import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNTS, DEFAULT_PASSWORD } from "../services/api";
import { 
  Home, 
  Key, 
  Building2, 
  Bookmark, 
  BarChart3, 
  RefreshCw, 
  LogOut, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle,
  ChevronDown
} from "lucide-react";

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, expiresAt, logout, refreshSession, refreshing, savedItems, login } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // Live countdown timer for token expiry
  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("Expired");
      } else {
        const totalSecs = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleAccountSwitch = async (email) => {
    if (user && user.email === email) return;
    setSwitchingAccount(true);
    try {
      await login(email, DEFAULT_PASSWORD);
      setShowUserMenu(false);
    } catch (err) {
      alert(`Failed to switch account: ${err.message}`);
    } finally {
      setSwitchingAccount(false);
    }
  };

  const navItems = [
    { id: "listings", label: "Buy Listings", icon: Home },
    { id: "rentals", label: "Rentals", icon: Key },
    { id: "projects", label: "Projects", icon: Building2 },
    { 
      id: "saved", 
      label: "Saved", 
      icon: Bookmark, 
      badge: savedItems.length > 0 ? savedItems.length : null 
    },
    { id: "insights", label: "Insights & Audit", icon: BarChart3, highlight: true }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-[#0b0f19]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & City Tag */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("listings")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                Ivy Homes <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">Hyderabad</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">v1.4 API Connected</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-sky-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Session & Status */}
          <div className="flex items-center space-x-3">
            
            {/* Token Expiry Timer & Manual Refresh */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-mono text-slate-300">
                  TTL: <strong className="text-sky-300">{timeLeft || "--:--"}</strong>
                </span>
                <button
                  onClick={refreshSession}
                  disabled={refreshing}
                  title="Manual Token Refresh (POST /auth/refresh)"
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
                </button>
              </div>
            )}

            {/* Account Switcher Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center font-bold text-white text-[10px]">
                    {user.name ? user.name[0] : user.email[0].toUpperCase()}
                  </div>
                  <span className="font-medium max-w-[100px] truncate">{user.email}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-slate-700 bg-[#0f172a]/95">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{user.name || "Logged In User"}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <p className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                        Switch Demo Account
                      </p>
                      {DEMO_ACCOUNTS.map((acc) => {
                        const isCurrent = user.email === acc.email;
                        return (
                          <button
                            key={acc.email}
                            onClick={() => handleAccountSwitch(acc.email)}
                            disabled={switchingAccount || isCurrent}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                              isCurrent
                                ? "bg-sky-500/15 text-sky-300 font-semibold"
                                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                            }`}
                          >
                            <span>{acc.email}</span>
                            {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-sky-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center px-1">
                      <button
                        onClick={refreshSession}
                        disabled={refreshing}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh Token
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
                      >
                        <LogOut className="w-3 h-3" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("login")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-800 bg-[#0b0f19] px-2 py-2 gap-1 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-sky-500 text-slate-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
