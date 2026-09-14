import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchProjects } from "../services/api";
import { ProjectCard } from "../components/ProjectCard";
import { ListingModal } from "../components/ListingModal";
import { 
  Search, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  X 
} from "lucide-react";

export const ProjectsPage = () => {
  const { accessToken } = useAuth();
  
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const [page, setPage] = useState(0);
  const limit = 20;

  const [locality, setLocality] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("total_units");
  const [order, setOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const LOCALITIES = [
    "gachibowli", "madhapur", "kondapur", "kukatpally", "banjara hills", 
    "jubilee hills", "manikonda", "miyapur", "nallagandla", "sarjapur road", "whitefield"
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        offset: page * limit,
        limit,
        sort_by: sortBy,
        order
      };

      if (locality) params.locality = locality.toLowerCase();
      if (status) params.project_status = status.toLowerCase();

      const response = await fetchProjects(params, accessToken);
      setProjects(response.results || []);
      setTotal(response.total || response.results?.length || 0);
    } catch (err) {
      setError(err.message || "Failed to load builder projects.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, locality, status, sortBy, order, accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      if (locality && item.locality?.toLowerCase() !== locality.toLowerCase()) return false;
      if (status && item.project_status?.toLowerCase() !== status.toLowerCase()) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.apartment_name?.toLowerCase().includes(term);
        const matchesDev = item.developer_name?.toLowerCase().includes(term);
        const matchesLoc = item.locality?.toLowerCase().includes(term);
        if (!matchesName && !matchesDev && !matchesLoc) return false;
      }
      return true;
    });
  }, [projects, locality, status, searchTerm]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Builder Projects <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">{total} Projects</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Discover new township developments & developer projects across Hyderabad</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search project name, developer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Locality</label>
            <select
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 capitalize"
            >
              <option value="">All Localities</option>
              {LOCALITIES.map((loc) => (
                <option key={loc} value={loc} className="capitalize">{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Project Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 capitalize"
            >
              <option value="">All Statuses</option>
              <option value="under construction">Under Construction</option>
              <option value="ready to move">Ready To Move</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="total_units">Total Units</option>
              <option value="launch_date">Launch Date</option>
              <option value="price_min">Min Price</option>
              <option value="price_max">Max Price</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Fetching projects from API...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl p-8 border border-slate-800 space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No builder projects match your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.project_id}
              project={project}
              onClick={(item) => setSelectedProject(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
          <span>Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong></span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <ListingModal
          item={selectedProject}
          type="project"
          onClose={() => setSelectedProject(null)}
        />
      )}

    </div>
  );
};
