import React from "react";
import { formatCurrency, normalizeArea, normalizeProjectPrice } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Building, 
  User, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Bookmark, 
  ShieldCheck, 
  Compass, 
  Car, 
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";

export const ListingModal = ({ item, type = "listing", onClose }) => {
  const { isItemSaved, toggleSaveItem } = useAuth();
  if (!item) return null;

  const itemId = item.listing_id || item.project_id;
  const saved = isItemSaved(itemId);
  const areaInfo = normalizeArea(item);

  // Price calculations
  let mainPriceDisplay = "N/A";
  let secondaryPriceDisplay = "";
  let pricePerSqft = null;

  if (type === "project") {
    const projPrice = normalizeProjectPrice(item.price_min, item.price_max);
    mainPriceDisplay = projPrice.formatted;
    if (projPrice.rawMin && projPrice.rawMax) {
      secondaryPriceDisplay = `Raw: ${formatCurrency(projPrice.rawMin)} – ${formatCurrency(projPrice.rawMax)}`;
    }
  } else if (type === "rental") {
    mainPriceDisplay = `${formatCurrency(item.price)} / mo`;
    if (item.deposit) {
      secondaryPriceDisplay = `Deposit: ${formatCurrency(item.deposit)} | Maintenance: ${formatCurrency(item.maintenance || 0)}/mo`;
    }
  } else {
    mainPriceDisplay = formatCurrency(item.price);
    if (item.carpet_area && item.price) {
      pricePerSqft = Math.round(item.price / item.carpet_area);
      secondaryPriceDisplay = `₹${pricePerSqft.toLocaleString('en-IN')} per sq.ft carpet area`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-[#0f172a] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between relative bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                {type === "project" ? "Builder Project" : type === "rental" ? "Rental" : (item.property_type || "Property")}
              </span>
              {item.is_verified && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Listing
                </span>
              )}
              {item.is_live !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${item.is_live ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {item.is_live ? "Active Live" : "Inactive"}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {item.apartment_name || item.title || `${item.bedroom} BHK Property`}
            </h2>

            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1 capitalize">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{item.locality}, Hyderabad, Telangana</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleSaveItem(item)}
              className={`p-2.5 rounded-xl border transition ${
                saved
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? "fill-rose-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Price Overview Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Price Quote</span>
              <div className="text-3xl font-black text-white mt-0.5 tracking-tight">
                {mainPriceDisplay}
              </div>
              {secondaryPriceDisplay && (
                <p className="text-xs text-sky-300 mt-1 font-mono">{secondaryPriceDisplay}</p>
              )}
            </div>

            {(item.listing_url || item.project_url) && (
              <a
                href={item.listing_url || item.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 hover:brightness-110 transition flex items-center justify-center gap-2 text-sm shrink-0"
              >
                View External Source <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {item.bedroom !== undefined && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                  <Bed className="w-4 h-4 text-sky-400" /> Bedrooms
                </div>
                <div className="text-lg font-bold text-white">{item.bedroom} BHK</div>
              </div>
            )}

            {item.bathroom !== undefined && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                  <Bath className="w-4 h-4 text-indigo-400" /> Bathrooms
                </div>
                <div className="text-lg font-bold text-white">{item.bathroom}</div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Maximize2 className="w-4 h-4 text-emerald-400" /> Area Breakdown
              </div>
              <div className="text-sm font-bold text-white truncate">{areaInfo.display}</div>
            </div>
          </div>

          {/* Detailed Property Attributes */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" /> Complete Property Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {item.furnishing && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Furnishing:</span>
                  <span className="font-semibold text-white capitalize">{item.furnishing}</span>
                </div>
              )}
              {item.facing_direction && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Facing Direction:</span>
                  <span className="font-semibold text-white capitalize">{item.facing_direction}</span>
                </div>
              )}
              {item.floor !== undefined && item.total_floors && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Floor Level:</span>
                  <span className="font-semibold text-white">Floor {item.floor} of {item.total_floors}</span>
                </div>
              )}
              {item.covered_parking !== undefined && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Covered Parking:</span>
                  <span className="font-semibold text-white">{item.covered_parking} Slot(s)</span>
                </div>
              )}
              {item.balcony !== undefined && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Balconies:</span>
                  <span className="font-semibold text-white">{item.balcony}</span>
                </div>
              )}
              {item.developer_name && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Developer:</span>
                  <span className="font-semibold text-amber-300">{item.developer_name}</span>
                </div>
              )}
              {item.rera_number && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">RERA Registration:</span>
                  <span className="font-mono font-semibold text-emerald-400">{item.rera_number}</span>
                </div>
              )}
              {item.posted_at && (
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Posted On:</span>
                  <span className="font-mono text-slate-300">{new Date(item.posted_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                {item.description}
              </p>
            </div>
          )}

          {/* Contact & Poster Card */}
          {(item.posted_by_name || item.posted_by_contact) && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.posted_by_name || "Property Agent"}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-sky-400 uppercase">
                      {item.posted_by || "Agent"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.posted_by_contact || "+91 Contact Available"}</p>
                </div>
              </div>

              {item.posted_by_contact && (
                <a
                  href={`tel:${item.posted_by_contact}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Poster
                </a>
              )}
            </div>
          )}

          {/* Map Location Bar */}
          {item.latitude && item.longitude && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> Coordinates: {item.latitude}, {item.longitude}
              </span>
              <a
                href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                Open Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
