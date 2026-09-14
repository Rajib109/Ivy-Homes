import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ListingsPage } from "./pages/ListingsPage";
import { RentalsPage } from "./pages/RentalsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SavedPage } from "./pages/SavedPage";
import { InsightsPage } from "./pages/InsightsPage";
import { LoginPage } from "./pages/LoginPage";
import { DEFAULT_PASSWORD } from "./services/api";
import { Heart, Building2, CheckCircle2, Shield } from "lucide-react";

const AppContent = () => {
  const { user, login, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("listings");
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Auto login demo1 on fresh start if not logged in
  useEffect(() => {
    if (!loading && !user && !autoLoginAttempted) {
      setAutoLoginAttempted(true);
      login("demo1@ivy.homes", DEFAULT_PASSWORD).catch((e) => {
        console.log("Initial auto login fallback notice:", e);
      });
    }
  }, [loading, user, autoLoginAttempted, login]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Sticky Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === "listings" && <ListingsPage />}
        {activeTab === "rentals" && <RentalsPage />}
        {activeTab === "projects" && <ProjectsPage />}
        {activeTab === "saved" && <SavedPage />}
        {activeTab === "insights" && <InsightsPage />}
        {activeTab === "login" && (
          <LoginPage onSuccess={() => setActiveTab("listings")} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070a12] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-white">Ivy Homes Property Engine</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">API Base: https://solve.ivy.homes</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> API Key: {import.meta.env.VITE_API_KEY ? "Connected" : "Not Set"}
            </span>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setActiveTab("insights")}
              className="text-sky-400 hover:underline font-semibold"
            >
              View API Audit Report
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
