import React from "react";
import { normalizeProjectPrice, formatCurrency } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  MapPin, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  Bookmark, 
  ExternalLink,
  Tag,
  Home
} from "lucide-react";

export const ProjectCard = ({ project, onClick }) => {
  const { isItemSaved, toggleSaveItem } = useAuth();
  const saved = isItemSaved(project.project_id);
  const priceInfo = normalizeProjectPrice(project.price_min, project.price_max);

  // Status styling badge
  const statusColor = project.project_status === "under construction"
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative">
      
      {/* Top Banner */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusColor}`}>
                {project.project_status || "Project"}
              </span>
              {project.developer_name && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
                  By {project.developer_name}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
              {project.apartment_name}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 capitalize">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{project.locality}, Hyderabad</span>
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveItem(project);
            }}
            title={saved ? "Remove from Saved" : "Save Project"}
            className={`p-2 rounded-xl border transition ${
              saved
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-rose-400" : ""}`} />
          </button>
        </div>

        {/* Normalized Price Range */}
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-300 tracking-tight">
              {priceInfo.formatted}
            </span>
            {project.total_listings !== undefined && (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Home className="w-3 h-3 text-slate-500" />
                {project.total_listings} Listings
              </span>
            )}
          </div>

          {priceInfo.rawMin && priceInfo.rawMax && (
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Raw: {formatCurrency(priceInfo.rawMin)} – {formatCurrency(priceInfo.rawMax)}
            </p>
          )}
        </div>
      </div>

      {/* Spec details */}
      <div className="px-5 py-3 bg-slate-900/40 grid grid-cols-3 gap-2 text-xs border-y border-slate-800/60">
        <div className="text-slate-300">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Units</span>
          <strong className="text-white">{project.total_units || "N/A"}</strong>
        </div>
        <div className="text-slate-300">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Towers / Floors</span>
          <strong className="text-white">{project.total_towers || "-"} T / {project.total_floors || "-"} F</strong>
        </div>
        <div className="text-slate-300">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Area Range</span>
          <strong className="text-white truncate block">
            {project.min_area_sqft ? `${project.min_area_sqft} - ${project.max_area_sqft} sqft` : "N/A"}
          </strong>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="truncate pr-2">
          {project.rera_number && (
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 shrink-0" /> RERA: {project.rera_number}
            </span>
          )}
        </div>

        <button
          onClick={() => onClick(project)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition text-xs shrink-0"
        >
          View Project <ExternalLink className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
