import { X, MapPin, Phone, Info, Tag, AlertTriangle } from "lucide-react";
import { Location, Category } from "@/types";
import { useMemo } from "react";

interface LocationDetailPanelProps {
    location: Location | null;
    categories: Category[];
    onClose: () => void;
}

export const LocationDetailPanel = ({
    location,
    categories,
    onClose,
}: LocationDetailPanelProps) => {
    const categoryName = useMemo(() => {
        if (!location?.category_id) return "-";
        const category = categories.find((c) => c.id === location.category_id);
        return category?.name || "-";
    }, [location, categories]);

    const subcategoryName = useMemo(() => {
        if (!location?.category_id || !location?.subcategory_id) return "-";
        const category = categories.find((c) => c.id === location.category_id);
        const subcategory = category?.subcategories.find(
            (s) => s.id === location.subcategory_id
        );
        return subcategory?.name || "-";
    }, [location, categories]);

    const coverImage = location?.images?.[0] || 'https://images.unsplash.com/photo-1764147385070-d0d45dfab547?q=80&w=1000&auto=format&fit=crop';

    if (!location) return null;

    return (
        <div className="fixed md:right-8 md:top-8 md:bottom-8 md:w-[400px] right-0 top-0 w-full h-full md:h-auto bg-white shadow-[var(--shadow-soft)] z-[2000] overflow-y-auto md:rounded-[var(--radius-xl)] border border-white/60 backdrop-blur-md transform transition-transform duration-300 ease-in-out scrollbar-hide">
            {/* Hero Section (Layla Banner Style) */}
            <div className="relative h-80 w-full group">
                <img
                    src={coverImage}
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--genshin-blue-primary)] via-transparent to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#4A72D4]/80 to-transparent mix-blend-multiply" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white shadow-lg transition-all cursor-pointer hover:scale-105 border border-white/30"
                >
                    <X size={20} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        </span>
                        <span className="text-sm font-semibold tracking-wide uppercase text-blue-50">{categoryName}</span>
                    </div>
                    <h2 className="text-4xl font-bold leading-none mb-3 drop-shadow-lg tracking-tight">{location.name}</h2>
                    <p className="text-blue-100 text-sm font-medium tracking-wide flex items-center gap-2 line-clamp-2 opacity-80">
                        {location.description || "Tidak ada deskripsi tersedia."}
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-6 bg-gradient-to-b from-blue-50/30 to-white">
                {/* Status/Condition Badge */}
                {location.condition && (
                    <div className="flex items-center gap-2 -mt-10 relative z-10">
                        <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border shadow-sm backdrop-blur-md ${location.condition === "Baik"
                                ? "bg-green-100/80 text-green-700 border-green-200"
                                : location.condition === "Rusak Ringan"
                                    ? "bg-yellow-100/80 text-yellow-700 border-yellow-200"
                                    : "bg-red-100/80 text-red-700 border-red-200"
                                }`}
                        >
                            {location.condition}
                        </span>
                    </div>
                )}

                {/* Sub Cards (Like "Recent Search" pills) */}
                <div className="space-y-4">
                    {/* Address Card */}
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className="p-2.5 bg-blue-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-[var(--genshin-blue-primary)] shrink-0" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Alamat</p>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                {location.address || "-"}
                            </p>
                            {location.dusun && (
                                <p className="text-xs text-[var(--genshin-blue-secondary)] mt-1 font-medium bg-blue-50/50 px-2 py-0.5 rounded-md inline-block">
                                    Dusun {location.dusun}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Subcategory & Contact Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                            <div className="mb-2 p-2 bg-purple-50 w-fit rounded-lg">
                                <Tag className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tipe</p>
                            <p className="text-sm font-bold text-gray-800 line-clamp-1" title={subcategoryName}>
                                {subcategoryName}
                            </p>
                        </div>

                        {location.contact ? (
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
                                <div className="mb-2 p-2 bg-green-50 w-fit rounded-lg">
                                    <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kontak</p>
                                <p className="text-[13px] font-bold text-gray-800 font-mono">
                                    {location.contact}
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60">
                                <div className="mb-2 p-2 bg-gray-100 w-fit rounded-lg">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Kontak</p>
                                <p className="text-xs font-medium text-gray-500">-</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Images Section (Gallery) */}
                {location.images && location.images.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Galeri Foto</p>
                            <span className="text-xs text-[var(--genshin-blue-secondary)] font-medium bg-blue-50 px-2 py-0.5 rounded-full">{location.images.length} Foto</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {location.images.map((url, index) => (
                                <div key={index} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all ring-2 ring-transparent hover:ring-[var(--genshin-blue-primary)] shadow-sm group/img" onClick={() => window.open(url, '_blank')}>
                                    <img
                                        src={url}
                                        alt={`${location.name} - ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-gray-500 font-mono bg-white border border-gray-200 px-2 py-1 rounded-md">
                        {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
                    </p>
                    {location.updated_at && (
                        <p className="text-[10px] text-gray-400 font-medium">
                            Updated: {new Date(location.updated_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
