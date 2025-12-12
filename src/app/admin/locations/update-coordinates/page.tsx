"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    MapPin,
    Search,
    Save,
    Loader2,
    Building,
    GraduationCap,
    Heart,
    Church,
    Store,
    Trees,
} from "lucide-react";
import {
    PageHeader,
    Card,
    CardHeader,
    Button,
    Badge,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableHeader,
} from "@/components/Admin";
import {
    searchAllPOI,
    getElementName,
    getElementCategory,
    OverpassElement,
} from "@/lib/overpassApi";

interface FoundLocation {
    id: string;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    osmId: number;
    tags: Record<string, string | undefined>;
    selected: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    Pendidikan: GraduationCap,
    Kesehatan: Heart,
    "Tempat Ibadah": Church,
    Infrastruktur: Building,
    Ekonomi: Store,
    Wisata: Trees,
    Lainnya: MapPin,
};

export default function UpdateCoordinatesPage() {
    const [foundLocations, setFoundLocations] = useState<FoundLocation[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setIsSearching(true);
        setHasSearched(true);
        setError(null);
        setFoundLocations([]);

        try {
            const elements = await searchAllPOI();

            if (elements.length === 0) {
                setError("Tidak ditemukan POI di wilayah ini. Coba perluas area pencarian.");
                setIsSearching(false);
                return;
            }

            const locations: FoundLocation[] = elements.map((el) => ({
                id: `osm-${el.type}-${el.id}`,
                name: getElementName(el),
                category: getElementCategory(el),
                latitude: el.lat,
                longitude: el.lon,
                osmId: el.id,
                tags: el.tags,
                selected: true,
            }));

            // Remove duplicates based on coordinates
            const seen = new Set<string>();
            const uniqueLocations = locations.filter((loc) => {
                const key = `${loc.latitude.toFixed(5)},${loc.longitude.toFixed(5)}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            setFoundLocations(uniqueLocations);
        } catch (err) {
            console.error("Search error:", err);
            setError("Gagal mencari data. Periksa koneksi internet Anda.");
        } finally {
            setIsSearching(false);
        }
    };

    const toggleSelectAll = () => {
        const allSelected = foundLocations.every((loc) => loc.selected);
        setFoundLocations((prev) =>
            prev.map((loc) => ({ ...loc, selected: !allSelected }))
        );
    };

    const toggleSelectOne = (id: string) => {
        setFoundLocations((prev) =>
            prev.map((loc) =>
                loc.id === id ? { ...loc, selected: !loc.selected } : loc
            )
        );
    };

    const handleSave = async () => {
        const selected = foundLocations.filter((loc) => loc.selected);

        if (selected.length === 0) {
            alert("Pilih minimal satu lokasi untuk disimpan");
            return;
        }

        if (!confirm(`Simpan ${selected.length} lokasi ke database?`)) return;

        setIsSaving(true);

        try {
            // Get or create categories
            const categoryMap = new Map<string, string>();
            const uniqueCategories = [...new Set(selected.map((loc) => loc.category))];

            for (const catName of uniqueCategories) {
                const { data: existing } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("name", catName)
                    .single();

                if (existing) {
                    categoryMap.set(catName, existing.id);
                } else {
                    const { data: created } = await supabase
                        .from("categories")
                        .insert([{ name: catName }])
                        .select("id")
                        .single();

                    if (created) {
                        categoryMap.set(catName, created.id);
                    }
                }
            }

            // Insert locations
            let successCount = 0;
            for (const loc of selected) {
                const { error } = await supabase.from("locations").insert([
                    {
                        name: loc.name,
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        category_id: categoryMap.get(loc.category) || null,
                        dusun: "Ngabul",
                        address: `Ngabul, Tahunan, Jepara`,
                        condition: "Baik",
                    },
                ]);

                if (!error) successCount++;
            }

            alert(`Berhasil menyimpan ${successCount} dari ${selected.length} lokasi!`);

            // Remove saved locations
            setFoundLocations((prev) => prev.filter((loc) => !loc.selected));
        } catch (err) {
            console.error("Save error:", err);
            alert("Gagal menyimpan data");
        } finally {
            setIsSaving(false);
        }
    };

    // Stats by category
    const categoryStats = Object.entries(
        foundLocations.reduce((acc, loc) => {
            acc[loc.category] = (acc[loc.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    );

    const selectedCount = foundLocations.filter((loc) => loc.selected).length;

    return (
        <div>
            <PageHeader
                title="Cari Koordinat Lokasi"
                description="Cari semua sekolah, puskesmas, masjid, kantor desa, dll di wilayah Ngabul, Tahunan, Jepara dari OpenStreetMap"
                backHref="/admin"
            />

            {/* Action Card */}
            <Card className="mb-6">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Pencarian dari OpenStreetMap
                            </h3>
                            <p className="text-sm text-gray-500">
                                Tekan tombol untuk mencari semua POI (sekolah, puskesmas, masjid, kantor desa, dll)
                                di wilayah <strong>Ngabul, Tahunan, Jepara</strong> menggunakan data OpenStreetMap
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || isSaving}
                                variant="primary"
                            >
                                {isSearching ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Mencari...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Cari Semua Koordinat
                                    </>
                                )}
                            </Button>

                            {selectedCount > 0 && (
                                <Button
                                    onClick={handleSave}
                                    disabled={isSearching || isSaving}
                                    variant="primary"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Simpan ({selectedCount})
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Category Stats */}
                    {categoryStats.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {categoryStats.map(([category, count]) => {
                                const Icon = CATEGORY_ICONS[category] || MapPin;
                                return (
                                    <div key={category} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Icon className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{count}</div>
                                            <div className="text-xs text-gray-500">{category}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            {/* Error */}
            {error && (
                <Card className="mb-6">
                    <div className="p-6 text-center text-red-600">
                        <p>{error}</p>
                    </div>
                </Card>
            )}

            {/* Results */}
            {!hasSearched ? (
                <Card>
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Siap Mencari Koordinat
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                            Tekan tombol &quot;Cari Semua Koordinat&quot; untuk mencari data dari OpenStreetMap.
                            Data yang dicari termasuk:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Badge variant="blue">Sekolah</Badge>
                            <Badge variant="green">Puskesmas</Badge>
                            <Badge variant="yellow">Masjid</Badge>
                            <Badge variant="gray">Kantor Desa</Badge>
                            <Badge variant="blue">Pasar</Badge>
                            <Badge variant="green">Taman</Badge>
                        </div>
                    </div>
                </Card>
            ) : foundLocations.length > 0 ? (
                <Card>
                    <CardHeader
                        title={`Hasil Pencarian (${foundLocations.length} lokasi)`}
                        action={
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={foundLocations.every((loc) => loc.selected)}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4"
                                    />
                                    Pilih Semua
                                </label>
                                <Badge variant="green">{selectedCount} dipilih</Badge>
                            </div>
                        }
                    />
                    <Table>
                        <TableHead>
                            <tr>
                                <TableHeader className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={foundLocations.every((loc) => loc.selected)}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4"
                                    />
                                </TableHeader>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>Kategori</TableHeader>
                                <TableHeader>Koordinat</TableHeader>
                            </tr>
                        </TableHead>
                        <TableBody>
                            {foundLocations.map((loc) => {
                                const Icon = CATEGORY_ICONS[loc.category] || MapPin;
                                return (
                                    <TableRow key={loc.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={loc.selected}
                                                onChange={() => toggleSelectOne(loc.id)}
                                                className="h-4 w-4"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-gray-400" />
                                                {loc.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="blue">{loc.category}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-gray-600">
                                            {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            ) : hasSearched && !isSearching && !error ? (
                <Card>
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Tidak Ada Hasil
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Tidak ditemukan POI di wilayah Ngabul, Tahunan, Jepara di OpenStreetMap.
                        </p>
                    </div>
                </Card>
            ) : null}
        </div>
    );
}
