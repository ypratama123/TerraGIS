"use client";

import {
  Menu,
  User,
  Layers,
  Settings,
  List,
  ChartColumnBig,
  LayoutDashboard,
  ClipboardList,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { ViewType } from "@/constants";

interface SidebarProps {
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  onPanelOpen?: () => void;
  isPanelOpen?: boolean;
  onPanelToggle?: (isOpen: boolean) => void;
  mode?: "map" | "admin";
}

// Map Navigation items
const MAP_NAV_ITEMS: { view: ViewType; icon: typeof Layers; title: string }[] =
  [
    { view: "layers", icon: Layers, title: "Layer & Filter" },
    { view: "list", icon: List, title: "Daftar Lokasi" },
    { view: "statistics", icon: ChartColumnBig, title: "Statistik" },
    { view: "profile", icon: User, title: "Profil" },
  ];

// Admin Navigation items
const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, title: "Dashboard" },
  { href: "/admin/locations/create", icon: Plus, title: "Tambah Lokasi" },
  { href: "/admin/reports", icon: ClipboardList, title: "Laporan" },
];

const Sidebar = ({
  currentView = "layers",
  onViewChange,
  onPanelOpen,
  isPanelOpen,
  onPanelToggle,
  mode = "map",
}: SidebarProps) => {
  const pathname = usePathname();

  const handleClick = useCallback(
    (view: ViewType) => {
      if (mode === "map") {
        if (view === currentView && isPanelOpen) {
          onPanelToggle?.(false);
        } else {
          onViewChange?.(view);
          onPanelToggle?.(true);
        }
      } else {
        onViewChange?.(view);
        onPanelOpen?.();
      }
    },
    [currentView, isPanelOpen, mode, onViewChange, onPanelToggle, onPanelOpen]
  );

  return (
    <div className="fixed md:left-4 md:top-4 md:bottom-4 md:w-20 md:h-auto md:flex-col md:py-6 bottom-0 left-0 w-full h-16 md:bg-[rgba(255,255,255,0.95)] bg-white/95 backdrop-blur-md border-t md:border border-white/50 flex flex-row items-center justify-around md:justify-start py-2 z-50 md:shadow-[var(--shadow-soft)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:rounded-[var(--radius-xl)] rounded-t-2xl transition-all duration-300">
      {/* Logo - Desktop Only */}
      <Link
        href="/"
        className="hidden md:flex mb-8 p-3 bg-gradient-to-br from-[var(--genshin-blue-primary)] to-[var(--genshin-blue-secondary)] rounded-2xl cursor-pointer hover:shadow-[var(--shadow-glow)] transition-all hover:scale-105 shadow-md text-white flex-col items-center justify-center gap-1 group"
        title="Kembali ke Peta"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <div className="w-4 h-4 rounded-full bg-white" />
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex md:flex-col flex-row gap-2 md:gap-4 w-full items-center justify-around md:justify-start px-2">
        {mode === "map"
          ? // Map Navigation
          MAP_NAV_ITEMS.map(({ view, icon: Icon, title }) => (
            <button
              key={view}
              onClick={() => handleClick(view)}
              className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all cursor-pointer group relative w-auto md:w-full flex justify-center ${currentView === view
                ? "bg-[var(--genshin-blue-primary)] text-white shadow-lg shadow-indigo-500/30 scale-105"
                : "text-gray-400 hover:bg-gray-100/80 hover:text-[var(--genshin-blue-primary)]"
                }`}
              title={title}
            >
              <Icon className={`w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110 ${currentView === view ? "animate-pulse" : ""}`} strokeWidth={currentView === view ? 2.5 : 2} />
              {currentView === view && (
                <div className="hidden md:block absolute inset-y-0 -right-2 w-1 bg-[var(--genshin-blue-primary)] rounded-full opacity-0" />
              )}
            </button>
          ))
          : // Admin Navigation
          ADMIN_NAV_ITEMS.map(({ href, icon: Icon, title }) => {
            const isActive =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all cursor-pointer group relative w-auto md:w-full flex justify-center ${isActive
                  ? "bg-[var(--genshin-blue-primary)] text-white shadow-lg shadow-indigo-500/30 scale-105"
                  : "text-gray-400 hover:bg-gray-100/80 hover:text-[var(--genshin-blue-primary)]"
                  }`}
                title={title}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" strokeWidth={isActive ? 2.5 : 2} />
              </Link>
            );
          })}
      </nav>

      {/* Bottom Actions - Desktop Only */}
      <div className="hidden md:flex mt-auto flex-col gap-6 w-full items-center px-2">
        {mode !== "map" && (
          <Link
            href="/"
            className="p-3.5 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            title="Keluar dari Admin"
          >
            <LogOut className="w-6 h-6" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
