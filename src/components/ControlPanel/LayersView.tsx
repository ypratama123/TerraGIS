import { Search, Filter, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { Category, Location } from "@/types";
import { CONDITION_FILTERS } from "@/constants";
import { useState, useMemo } from "react";
import { LocationItem } from "./LocationItem";

interface LayersViewProps {
  categories: Category[];
  locations: Location[];
  selectedSubcategories: string[];
  selectedConditions: string[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onSubcategoryChange: (id: string) => void;
  onSubcategoriesChange: (ids: string[]) => void;
  onConditionChange: (condition: string) => void;
  onLocationClick?: (location: Location) => void;
}

export const LayersView = ({
  categories,
  locations,
  selectedSubcategories,
  selectedConditions,
  loading,
  searchQuery,
  onSearchChange,
  onReset,
  onSubcategoryChange,
  onSubcategoriesChange,
  onConditionChange,
  onLocationClick,
}: LayersViewProps) => {
  // Calculate used subcategory IDs
  const usedSubcategoryIds = useMemo(() => {
    const ids = new Set<string>();
    locations.forEach((loc) => {
      if (loc.subcategory_id) {
        ids.add(loc.subcategory_id);
      }
    });
    return ids;
  }, [locations]);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name?.toLowerCase().includes(query) ||
        loc.description?.toLowerCase().includes(query) ||
        loc.address?.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari lokasi..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--genshin-blue-primary)] focus:border-transparent transition-all shadow-inner"
        />
      </div>

      {searchQuery.trim() ? (
        // Search Results View
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-700">
              Hasil Pencarian
            </h2>
            <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredLocations.length} lokasi
            </span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Lokasi tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLocations.map((location) => (
                <LocationItem
                  key={location.id}
                  location={location}
                  onClick={() => onLocationClick?.(location)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Default Layers View
        <>
          {/* Layers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--genshin-blue-primary)]" />
                Layer Pemetaan
              </h2>
              <button
                onClick={onReset}
                className="text-[10px] text-[var(--genshin-blue-secondary)] font-medium hover:text-[var(--genshin-blue-primary)] cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>

            {loading ? (
              <div className="text-xs text-gray-400 animate-pulse">Memuat kategori...</div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    usedSubcategoryIds={usedSubcategoryIds}
                    selectedSubcategories={selectedSubcategories}
                    onSubcategoryChange={onSubcategoryChange}
                    onCategoryToggle={(cat, isChecked) => {
                      // Filter subcategories to only include used ones
                      const visibleSubcategories = cat.subcategories?.filter(s => usedSubcategoryIds.has(s.id)) || [];

                      if (visibleSubcategories.length > 0) {
                        const subIds = visibleSubcategories.map((s) => s.id);
                        // Also include the category ID itself
                        const allIds = [...subIds, cat.id];

                        if (isChecked) {
                          // Add all visible subcategories + category ID that are not already selected
                          const toAdd = allIds.filter(
                            (id) => !selectedSubcategories.includes(id)
                          );
                          onSubcategoriesChange([
                            ...selectedSubcategories,
                            ...toAdd,
                          ]);
                        } else {
                          // Remove all visible subcategories + category ID
                          const newSelected = selectedSubcategories.filter(
                            (id) => !allIds.includes(id)
                          );
                          onSubcategoriesChange(newSelected);
                        }
                      } else {
                        onSubcategoryChange(cat.id);
                      }
                    }}
                  />
                ))}
                {categories.length === 0 && (
                  <div className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Belum ada kategori data.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Condition Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[var(--genshin-blue-primary)]" />
                Filter Kondisi
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {CONDITION_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => onConditionChange(status)}
                  className={`px-3 py-1.5 text-[10px] font-medium rounded-full transition-all cursor-pointer border shadow-sm ${selectedConditions.includes(status)
                    ? "bg-[var(--genshin-blue-primary)] border-[var(--genshin-blue-primary)] text-white shadow-[var(--shadow-glow)]"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Extracted sub-component for category items
interface CategoryItemProps {
  category: Category;
  usedSubcategoryIds: Set<string>;
  selectedSubcategories: string[];
  onSubcategoryChange: (id: string) => void;
  onCategoryToggle: (category: Category, isChecked: boolean) => void;
}

const CategoryItem = ({
  category,
  usedSubcategoryIds,
  selectedSubcategories,
  onSubcategoryChange,
  onCategoryToggle,
}: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter subcategories based on usage
  const visibleSubcategories = useMemo(() => {
    return category.subcategories?.filter(sub => usedSubcategoryIds.has(sub.id)) || [];
  }, [category.subcategories, usedSubcategoryIds]);

  const hasSubcategories = visibleSubcategories.length > 0;

  // Check if all visible subcategories are selected
  const isAllSelected = useMemo(() => {
    if (!hasSubcategories) {
      return selectedSubcategories.includes(category.id);
    }
    // Check if all visible subcategories AND the category itself are selected
    return (
      visibleSubcategories.every((sub) =>
        selectedSubcategories.includes(sub.id)
      ) && selectedSubcategories.includes(category.id)
    );
  }, [category.id, selectedSubcategories, hasSubcategories, visibleSubcategories]);

  // Check if some but not all visible subcategories are selected
  const isIndeterminate = useMemo(() => {
    if (!hasSubcategories) return false;
    const subIds = visibleSubcategories.map((s) => s.id);
    // Include category.id in the count of "selectable items"
    const allIds = [...subIds, category.id];
    const selectedCount = allIds.filter((id) =>
      selectedSubcategories.includes(id)
    ).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  }, [category.id, selectedSubcategories, hasSubcategories, visibleSubcategories]);

  const handleCategoryClick = () => {
    onCategoryToggle(category, !isAllSelected);
  };

  return (
    <div className="border border-indigo-50 rounded-xl overflow-hidden bg-white/50 hover:bg-white transition-all hover:shadow-sm group/card">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 bg-white text-[var(--genshin-blue-primary)] focus:ring-[var(--genshin-blue-primary)] cursor-pointer accent-[var(--genshin-blue-primary)]"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={handleCategoryClick}
          />
          <span className="text-xs font-semibold text-gray-700 group-hover/card:text-[var(--genshin-blue-primary)] transition-colors">
            {category.name}
          </span>
        </div>
        {hasSubcategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-[var(--genshin-blue-primary)] p-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-2 space-y-1 bg-indigo-50/30 border-t border-indigo-50">
          {hasSubcategories ? (
            <>
              {visibleSubcategories.map((sub) => (
                <CheckboxItem
                  key={sub.id}
                  id={sub.id}
                  label={sub.name}
                  checked={selectedSubcategories.includes(sub.id)}
                  onChange={() => onSubcategoryChange(sub.id)}
                  className="ml-6"
                />
              ))}
            </>
          ) : (
            null
          )}
        </div>
      )}
    </div>
  );
};

// Reusable checkbox component
interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const CheckboxItem = ({
  label,
  checked,
  onChange,
  className = "",
}: CheckboxItemProps) => (
  <label
    className={`flex items-center gap-3 p-1.5 hover:bg-indigo-100/50 rounded-lg cursor-pointer group ${className}`}
  >
    <input
      type="checkbox"
      className="w-3.5 h-3.5 rounded border-gray-300 bg-white text-[var(--genshin-blue-primary)] focus:ring-[var(--genshin-blue-primary)] cursor-pointer accent-[var(--genshin-blue-primary)]"
      checked={checked}
      onChange={onChange}
    />
    <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
      {label}
    </span>
  </label>
);
