import React from "react";
import { formatCurrency, normalizeArea } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  Bookmark, 
  ShieldAlert, 
  Wrench, 
  ExternalLink,
  Building
} from "lucide-react";

export const RentalCard = ({ rental, onClick }) => {
  const { isItemSaved, toggleSaveItem } = useAuth();
  const saved = isItemSaved(rental.listing_id);
  const areaInfo = normalizeArea(rental);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative">
      
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
                Rental
              </span>
              {rental.furnishing && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 capitalize">
                  {rental.furnishing}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
              {rental.title || `${rental.bedroom} BHK for Rent in ${rental.locality}`}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 capitalize">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{rental.locality}, Hyderabad</span>
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveItem(rental);
            }}
            title={saved ? "Remove from Saved" : "Save Rental"}
            className={`p-2 rounded-xl border transition ${
              saved
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-rose-400" : ""}`} />
          </button>
        </div>

        {/* Rent & Deposit/Maintenance */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(rental.price)}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ month</span>
          </div>
          
          <div className="text-right text-[11px] text-slate-400">
            {rental.deposit && (
              <p className="flex items-center gap-1 justify-end">
                <ShieldAlert className="w-3 h-3 text-slate-500" />
                <span>Deposit: <strong>{formatCurrency(rental.deposit, true)}</strong></span>
              </p>
            )}
            {rental.maintenance && (
              <p className="flex items-center gap-1 justify-end text-slate-400">
                <Wrench className="w-3 h-3 text-slate-500" />
                <span>Maint: <strong>{formatCurrency(rental.maintenance)}</strong>/mo</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Details Grid */}
      <div className="px-5 py-3 bg-slate-900/40 grid grid-cols-3 gap-2 text-xs border-y border-slate-800/60">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Bed className="w-4 h-4 text-sky-400" />
          <span><strong>{rental.bedroom || "-"}</strong> BHK</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Bath className="w-4 h-4 text-indigo-400" />
          <span><strong>{rental.bathroom || "-"}</strong> Bath</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span className="truncate"><strong>{rental.carpet_area || "-"}</strong> sq.ft</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 text-[11px]">
          {rental.posted_by && (
            <span className="capitalize px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
              Posted by {rental.posted_by}
            </span>
          )}
        </div>

        <button
          onClick={() => onClick(rental)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-slate-950 transition text-xs"
        >
          View Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
