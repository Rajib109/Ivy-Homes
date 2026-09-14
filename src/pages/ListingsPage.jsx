import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchListings } from "../services/api";
import { ListingCard } from "../components/ListingCard";
import { ListingModal } from "../components/ListingModal";
import { 
  Search, 
  SlidersHorizontal, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Home,
  Check,
  X
} from "lucide-react";

export const ListingsPage = () => {
  const { accessToken } = useAuth();
  
  // Data state
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const limit = 20;

  // Filter state
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("posted_at");
  const [order, setOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  // Known localities list for quick dropdown filter
  const LOCALITIES = [
    "gachibowli", "madhapur", "kondapur", "kukatpally", "banjara hills", 
    "jubilee hills", "manikonda", "miyapur", "nallagandla", "kompally", "sarjapur road", "whitefield", "koramangala"
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
      if (propertyType) params.property_type = propertyType.toLowerCase();
      if (furnishing) params.furnishing = furnishing.toLowerCase();
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);

      const response = await fetchListings(params, accessToken);
      setListings(response.results || []);
      setTotal(response.total || response.results?.length || 0);
    } catch (err) {
      setError(err.message || "Failed to load property listings.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, locality, bhk, propertyType, furnishing, minPrice, maxPrice, sortBy, order, accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side strict filtering & search fallback
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Locality check
      if (locality && item.locality?.toLowerCase() !== locality.toLowerCase()) {
        return false;
      }
      // BHK check
      if (bhk && Number(item.bedroom) !== Number(bhk)) {
        return false;
      }
      // Property type check
      if (propertyType && item.property_type?.toLowerCase() !== propertyType.toLowerCase()) {
        return false;
      }
      // Furnishing check
      if (furnishing && item.furnishing?.toLowerCase() !== furnishing.toLowerCase()) {
        return false;
      }
      // Min price check
      if (minPrice && Number(item.price) < Number(minPrice)) {
        return false;
      }
      // Max price check
      if (maxPrice && Number(item.price) > Number(maxPrice)) {
        return false;
      }
      // Free text search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.apartment_name?.toLowerCase().includes(term);
        const matchesLoc = item.locality?.toLowerCase().includes(term);
        const matchesDesc = item.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesLoc && !matchesDesc) return false;
      }
      return true;
    });
  }, [listings, locality, bhk, propertyType, furnishing, minPrice, maxPrice, searchTerm]);

  const clearFilters = () => {
    setLocality("");
    setBhk("");
    setPropertyType("");
    setFurnishing("");
    setMinPrice("");
    setMaxPrice("");
    setSearchTerm("");
    setPage(0);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Sale Listings <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">{total} Available</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Browse verified properties for sale with multi-param filtering</p>
        </div>

        {/* Free text search bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search locality, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 transition"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Control Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter Properties
          </span>
          {(locality || bhk || propertyType || furnishing || minPrice || maxPrice || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <X className="w-3 h-3" /> Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Locality dropdown */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Locality</label>
            <select
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500 capitalize"
            >
              <option value="">All Localities</option>
              {LOCALITIES.map((loc) => (
                <option key={loc} value={loc} className="capitalize">{loc}</option>
              ))}
            </select>
          </div>

          {/* BHK Pill Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Bedrooms (BHK)</label>
            <select
              value={bhk}
              onChange={(e) => { setBhk(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => { setPropertyType(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500 capitalize"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="independent house">Independent House</option>
              <option value="plot">Plot</option>
              <option value="builder floor">Builder Floor</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Furnishing</label>
            <select
              value={furnishing}
              onChange={(e) => { setFurnishing(e.target.value); setPage(0); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500 capitalize"
            >
              <option value="">All Furnishing</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully-Furnished</option>
            </select>
          </div>

          {/* Sort By & Order */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="posted_at">Date Posted</option>
                <option value="price">Price</option>
                <option value="carpet_area">Carpet Area</option>
                <option value="bedroom">Bedrooms</option>
              </select>
              <button
                onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs"
                title={`Order: ${order.toUpperCase()}`}
              >
                {order === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

        </div>

        {/* Price Range Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 font-semibold">Price Range (₹):</span>
          <input
            type="number"
            placeholder="Min Price (e.g. 5000000)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs w-36 focus:outline-none focus:border-sky-500"
          />
          <span className="text-slate-600">to</span>
          <input
            type="number"
            placeholder="Max Price (e.g. 20000000)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs w-36 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Fetching listings from API...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-slate-900 text-xs text-white font-bold border border-slate-800 hover:border-slate-700"
          >
            Retry Fetching
          </button>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl p-8 border border-slate-800 space-y-3">
          <Home className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No properties match your filters</h3>
          <p className="text-xs text-slate-400">Try adjusting your locality, BHK, or price range parameters.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs hover:bg-sky-500 hover:text-slate-950 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Property Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              onClick={(item) => setSelectedListing(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({total} total results)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 hover:text-white transition flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal Popup */}
      {selectedListing && (
        <ListingModal
          item={selectedListing}
          type="listing"
          onClose={() => setSelectedListing(null)}
        />
      )}

    </div>
  );
};
