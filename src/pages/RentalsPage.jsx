import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchRentals } from "../services/api";
import { RentalCard } from "../components/RentalCard";
import { ListingModal } from "../components/ListingModal";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Key, 
  X 
} from "lucide-react";

export const RentalsPage = () => {
  const { accessToken } = useAuth();
  
  const [rentals, setRentals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);

  const [page, setPage] = useState(0);
  const limit = 20;

  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [sortBy, setSortBy] = useState("posted_at");
  const [order, setOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const LOCALITIES = [
    "gachibowli", "madhapur", "kondapur", "kukatpally", "banjara hills", 
    "jubilee hills", "manikonda", "miyapur", "nallagandla", "koramangala"
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
      if (bhk) params.bhk = Number(bhk);
      if (furnishing) params.furnishing = furnishing.toLowerCase();

      const response = await fetchRentals(params, accessToken);
      setRentals(response.results || []);
      setTotal(response.total || response.results?.length || 0);
    } catch (err) {
      setError(err.message || "Failed to load rental listings.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, locality, bhk, furnishing, sortBy, order, accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side strict filtering fallback
  const filteredRentals = useMemo(() => {
    return rentals.filter((item) => {
      if (locality && item.locality?.toLowerCase() !== locality.toLowerCase()) return false;
      if (bhk && Number(item.bedroom) !== Number(bhk)) return false;
      if (furnishing && item.furnishing?.toLowerCase() !== furnishing.toLowerCase()) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(term);
        const matchesApt = item.apartment_name?.toLowerCase().includes(term);
        const matchesLoc = item.locality?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesApt && !matchesLoc) return false;
      }
      return true;
    });
  }, [rentals, locality, bhk, furnishing, searchTerm]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Rental Listings <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">{total} Available</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Browse verified rental apartments, homes & villas in Hyderabad</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search rental title, locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Locality</label>
            <select
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 capitalize"
            >
              <option value="">All Localities</option>
              {LOCALITIES.map((loc) => (
                <option key={loc} value={loc} className="capitalize">{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Bedrooms (BHK)</label>
            <select
              value={bhk}
              onChange={(e) => { setBhk(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Furnishing</label>
            <select
              value={furnishing}
              onChange={(e) => { setFurnishing(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 capitalize"
            >
              <option value="">All Furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="posted_at">Date Posted</option>
              <option value="price">Rent Price</option>
              <option value="carpet_area">Carpet Area</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Fetching rentals from API...</p>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl p-8 border border-slate-800 space-y-3">
          <Key className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No rental listings match your filters</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => (
            <RentalCard
              key={rental.listing_id}
              rental={rental}
              onClick={(item) => setSelectedRental(item)}
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
      {selectedRental && (
        <ListingModal
          item={selectedRental}
          type="rental"
          onClose={() => setSelectedRental(null)}
        />
      )}

    </div>
  );
};
