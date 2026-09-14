import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ListingCard } from "../components/ListingCard";
import { RentalCard } from "../components/RentalCard";
import { ProjectCard } from "../components/ProjectCard";
import { ListingModal } from "../components/ListingModal";
import { Bookmark, Trash2, Heart, Sparkles } from "lucide-react";

export const SavedPage = () => {
  const { user, savedItems, toggleSaveItem } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Please sign in to view saved properties</h2>
        <p className="text-xs text-slate-400">Saved listings are persisted per logged-in user account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Saved Properties <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">{savedItems.length} Saved</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Bookmarked listings for user <strong className="text-sky-300 font-mono">{user.email}</strong></p>
        </div>

        {savedItems.length > 0 && (
          <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Saved in localStorage for {user.email}
          </div>
        )}
      </div>

      {/* Content */}
      {savedItems.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-2xl p-8 border border-slate-800 space-y-3">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No saved properties yet</h3>
          <p className="text-xs text-slate-400">Click the bookmark icon on any listing, rental, or project to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => {
            const itemId = item.listing_id || item.project_id;
            
            if (item.project_id) {
              return (
                <ProjectCard
                  key={itemId}
                  project={item}
                  onClick={(i) => setSelectedItem({ item: i, type: "project" })}
                />
              );
            }
            if (item.listing_id && item.listing_id.startsWith("R")) {
              return (
                <RentalCard
                  key={itemId}
                  rental={item}
                  onClick={(i) => setSelectedItem({ item: i, type: "rental" })}
                />
              );
            }
            return (
              <ListingCard
                key={itemId}
                listing={item}
                onClick={(i) => setSelectedItem({ item: i, type: "listing" })}
              />
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedItem && (
        <ListingModal
          item={selectedItem.item}
          type={selectedItem.type}
          onClose={() => setSelectedItem(null)}
        />
      )}

    </div>
  );
};
