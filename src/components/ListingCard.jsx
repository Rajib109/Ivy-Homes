import React from "react";
import { formatCurrency, normalizeArea } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Bed, 
  Bath, 
  Maximize2, 
  MapPin, 
  CheckCircle2, 
  Bookmark, 
  Building, 
  Compass, 
  Calendar,
  ExternalLink,
  Car
} from "lucide-react";

export const ListingCard = ({ listing, onClick }) => {
  const { isItemSaved, toggleSaveItem } = useAuth();
  const saved = isItemSaved(listing.listing_id);
  const areaInfo = normalizeArea(listing);

  // Price per sqft calculation
  const pricePerSqft = listing.carpet_area && listing.price 
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative">
      
      {/* Top Banner & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wide">
                {listing.property_type || "Apartment"}
              </span>
              {listing.is_verified && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
              {listing.furnishing && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 capitalize">
                  {listing.furnishing}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
              {listing.apartment_name || `${listing.bedroom} BHK ${listing.property_type}`}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 capitalize">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{listing.locality}, Hyderabad</span>
            </p>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveItem(listing);
            }}
            title={saved ? "Remove from Saved" : "Save Listing"}
            className={`p-2 rounded-xl border transition ${
              saved
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-rose-400" : ""}`} />
          </button>
        </div>

        {/* Price & Price/Sqft */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(listing.price, true)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-mono">
              ({formatCurrency(listing.price)})
            </span>
          </div>
          {pricePerSqft && (
            <span className="text-xs font-semibold text-slate-400 font-mono">
              ₹{pricePerSqft.toLocaleString('en-IN')}/sq.ft
            </span>
          )}
        </div>
      </div>

      {/* Property Details Grid */}
      <div className="px-5 py-3 bg-slate-900/40 grid grid-cols-3 gap-2 text-xs border-y border-slate-800/60">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Bed className="w-4 h-4 text-sky-400" />
          <span><strong>{listing.bedroom || "-"}</strong> BHK</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Bath className="w-4 h-4 text-indigo-400" />
          <span><strong>{listing.bathroom || "-"}</strong> Bath</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span className="truncate"><strong>{listing.carpet_area || "-"}</strong> sq.ft</span>
        </div>
      </div>

      {/* Footer Info & View Detail CTA */}
      <div className="p-4 pt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3 text-[11px]">
          {listing.floor !== undefined && listing.total_floors && (
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-500" /> Floor {listing.floor}/{listing.total_floors}
            </span>
          )}
          {listing.facing_direction && (
            <span className="capitalize hidden sm:inline flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-500" /> {listing.facing_direction}
            </span>
          )}
        </div>

        <button
          onClick={() => onClick(listing)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500 hover:text-slate-950 transition text-xs"
        >
          View Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
