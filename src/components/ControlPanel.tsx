"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Category, Location } from "@/types";
import {
  SIDEBAR_WIDTH,
  PANEL_WIDTH,
  TOGGLE_BUTTON_SIZE,
  ViewType,
} from "@/constants";
import { LayersView } from "./ControlPanel/LayersView";
import { SettingsView } from "./ControlPanel/SettingsView";
import { ProfileSection } from "./ControlPanel/ProfileSection";
import { ListView } from "./ControlPanel/ListView";
import { StatisticsView } from "./ControlPanel/StatisticsView";

// Panel header configuration
const PANEL_HEADERS: Record<ViewType, { title: string; subtitle: string }> = {
  layers: { title: "SIG Desa Ngabul Jepara", subtitle: "Infrastruktur & Fasilitas" },
  list: { title: "Daftar Lokasi", subtitle: "Detail Infrastruktur" },
  statistics: { title: "Statistik Wilayah", subtitle: "Data & Informasi" },
  profile: { title: "Profil", subtitle: "Akses Pengguna" },
  settings: { title: "Pengaturan Peta", subtitle: "Tampilan & Gaya" },
};

interface ControlPanelProps {
  categories: Category[];
  locations: Location[];
  allLocations?: Location[]; // Added allLocations prop
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  selectedConditions: string[];
  onConditionsChange: (conditions: string[]) => void;
  loading: boolean;
  currentView?: ViewType;
  currentStyle?: string;
  onStyleChange?: (style: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onLocationClick?: (location: Location) => void;
}

const ControlPanel = ({
  categories,
  locations,
  allLocations,
  selectedSubcategories,
  onSubcategoriesChange,
  selectedConditions,
  onConditionsChange,
  loading,
  currentView = "layers",
  currentStyle = "streets",
  onStyleChange,
  isOpen,
  onOpenChange,
  searchQuery = "",
  onSearchChange,
  onLocationClick,
}: ControlPanelProps) => {
  // Internal state removed, using controlled isOpen prop

  const handleToggle = useCallback(() => {
    onOpenChange(!isOpen);
  }, [isOpen, onOpenChange]);

  const handleSubcategoryChange = useCallback(
    (id: string) => {
      const updated = selectedSubcategories.includes(id)
        ? selectedSubcategories.filter((item) => item !== id)
        : [...selectedSubcategories, id];
      onSubcategoriesChange(updated);
    },
    [selectedSubcategories, onSubcategoriesChange]
  );

  const handleConditionChange = useCallback(
    (condition: string) => {
      const updated = selectedConditions.includes(condition)
        ? selectedConditions.filter((item) => item !== condition)
        : [...selectedConditions, condition];
      onConditionsChange(updated);
    },
    [selectedConditions, onConditionsChange]
  );

  const handleReset = useCallback(() => {
    onSubcategoriesChange([]);
    onConditionsChange([]);
    onSearchChange?.("");
  }, [onSubcategoriesChange, onConditionsChange, onSearchChange]);

  // Calculate toggle button position
  const toggleButtonLeft = useMemo(
    () => (isOpen ? SIDEBAR_WIDTH + PANEL_WIDTH + 30 : SIDEBAR_WIDTH + 20),
    [isOpen]
  );

  const header = PANEL_HEADERS[currentView];

  return (
    <>
      {/* Panel Container */}
      <div
        className={`fixed md:left-28 md:top-4 md:bottom-4 md:w-96 left-0 bottom-16 md:bottom-auto w-full max-h-[60vh] md:max-h-full bg-[rgba(255,255,255,0.92)] backdrop-blur-xl border border-white/60 flex flex-col z-40 shadow-[var(--shadow-soft)] md:rounded-[var(--radius-xl)] rounded-t-[var(--radius-xl)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isOpen ? "translate-x-0 translate-y-0 opacity-100" : "md:-translate-x-[150%] translate-y-full opacity-0"
          }`}
      >
        {/* Header */}
        <div className="p-8 pb-4 bg-gradient-to-b from-white/50 to-transparent">
          <h1 className="text-2xl font-bold text-[var(--genshin-text-primary)] whitespace-nowrap tracking-tight">
            {header.title}
          </h1>
          <p className="text-sm text-[var(--genshin-blue-secondary)] mt-1 whitespace-nowrap font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--genshin-blue-secondary)] inline-block" />
            {header.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-0 overflow-y-auto flex-1 text-gray-600 scrollbar-hide">
          {currentView === "layers" && (
            <LayersView
              categories={categories}
              locations={allLocations || locations}
              selectedSubcategories={selectedSubcategories}
              selectedConditions={selectedConditions}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={(query) => onSearchChange?.(query)}
              onReset={handleReset}
              onSubcategoryChange={handleSubcategoryChange}
              onSubcategoriesChange={onSubcategoriesChange}
              onConditionChange={handleConditionChange}
              onLocationClick={onLocationClick}
            />
          )}
          {currentView === "list" && (
            <ListView
              locations={locations}
              loading={loading}
              onLocationClick={onLocationClick}
            />
          )}
          {currentView === "statistics" && (
            <StatisticsView locations={locations} categories={categories} />
          )}
          {currentView === "profile" && <ProfileSection />}
          {currentView === "settings" && (
            <SettingsView
              currentStyle={currentStyle}
              onStyleChange={(style) => onStyleChange?.(style)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
