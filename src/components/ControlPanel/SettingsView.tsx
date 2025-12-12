"use client";

import { Settings, Map as MapIcon, Sun, Moon, Mountain } from "lucide-react";
import { MAP_STYLES } from "@/constants";
import type { LucideIcon } from "lucide-react";

// Icon mapping for styles
const STYLE_ICONS: Record<string, LucideIcon> = {
  streets: MapIcon,
  outdoor: Mountain,
  dark: Moon,
  light: Sun,
  satellite: MapIcon,
};

interface SettingsViewProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

export const SettingsView = ({
  currentStyle,
  onStyleChange,
}: SettingsViewProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          Tampilan Peta
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MAP_STYLES.map((style) => {
          const Icon = STYLE_ICONS[style.id] || MapIcon;
          const isSelected = currentStyle === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Icon className="w-5 h-5 mb-1.5" />
              <span className="text-[10px] font-medium">{style.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
