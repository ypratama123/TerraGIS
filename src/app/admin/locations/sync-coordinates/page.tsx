"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    MapPin,
    Search,
    Save,
    Loader2,
    CheckCircle,
    Trash2,
    ExternalLink,
    Download,
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
    Input,
    Select,
} from "@/components/Admin";

interface ScrapedLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    category: string;
    selected: boolean;
}

// Preset search queries for Ngabul area
const SEARCH_PRESETS = [
    { label: "Pendidikan", query: "pendidikan sekolah" },
    { label: "Masjid & Mushola", query: "masjid mushola" },
    { label: "Kesehatan", query: "puskesmas klinik" },
    { label: "Kantor Pemerintah", query: "kantor desa kelurahan" },
    { label: "Toko & Warung", query: "toko warung" },
    { label: "Semua POI", query: "ngabul tahunan jepara" },
];

export default function SyncCoordinatesPage() {
    const [scrapedLocations, setScrapedLocations] = useState<ScrapedLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchUrl, setSearchUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [lastQuery, setLastQuery] = useState("");

    // Scrape from URL or query
    const handleScrape = async (customQuery?: string) => {
        const query = customQuery || searchQuery;
        const url = searchUrl;

        if (!query && !url) {
            setError("Masukkan URL Google Maps atau kata kunci pencarian");
            return;
        }

        setIsLoading(true);
        setError(null);
        setScrapedLocations([]);

        try {
            const response = await fetch("/api/scrape-maps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, query }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal melakukan scraping");
            }

            if (data.places.length === 0) {
                setError(`Tidak ditemukan lokasi untuk "${data.query}". Coba kata kunci lain.`);
                return;
            }

            const locations: ScrapedLocation[] = data.places.map((place: any) => ({
                id: place.placeId || `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: place.name,
                latitude: place.latitude,
                longitude: place.longitude,
                address: place.address,
                category: place.category,
                selected: true,
            }));

            setScrapedLocations(locations);
            setLastQuery(data.query);
        } catch (err) {
            console.error("Scrape error:", err);
            setError(err instanceof Error ? err.message : "Gagal melakukan scraping");
        } finally {
            setIsLoading(false);
        }
    };

    // Open Google Maps to verify
    const openInGoogleMaps = (loc: ScrapedLocation) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
        window.open(url, "_blank");
    };

    // Remove a location from list
    const removeLocation = (id: string) => {
        setScrapedLocations((prev) => prev.filter((loc) => loc.id !== id));
    };

    // Toggle selection
    const toggleSelect = (id: string) => {
        setScrapedLocations((prev) =>
            prev.map((loc) =>
                loc.id === id ? { ...loc, selected: !loc.selected } : loc
            )
        );
    };

    // Toggle all
    const toggleSelectAll = () => {
        const allSelected = scrapedLocations.every((loc) => loc.selected);
        setScrapedLocations((prev) =>
            prev.map((loc) => ({ ...loc, selected: !allSelected }))
        );
    };

    // Update category for a location
    const updateCategory = (id: string, category: string) => {
        setScrapedLocations((prev) =>
            prev.map((loc) =>
                loc.id === id ? { ...loc, category } : loc
            )
        );
    };

    // Save to database
    const handleSave = async () => {
        const selected = scrapedLocations.filter((loc) => loc.selected);

        if (selected.length === 0) {
            alert("Pilih minimal satu lokasi untuk disimpan");
            return;
        }

        if (!confirm(`Simpan ${selected.length} lokasi baru ke database?`)) return;

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
                        address: loc.address,
                        condition: "Baik",
                    },
                ]);

                if (!error) successCount++;
            }

            alert(`Berhasil menyimpan ${successCount} dari ${selected.length} lokasi!`);

            // Remove saved locations from list
            setScrapedLocations((prev) => prev.filter((loc) => !loc.selected));
        } catch (err) {
            console.error("Save error:", err);
            alert("Gagal menyimpan data");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCount = scrapedLocations.filter((loc) => loc.selected).length;
    const CATEGORIES = ["Pendidikan", "Kesehatan", "Tempat Ibadah", "Pemerintahan", "Ekonomi", "Infrastruktur", "Wisata", "Lainnya"];

    return (
        <div>
            <PageHeader
                title="Scraping Lokasi dari Google Maps"
                description="Otomatis cari dan tambahkan lokasi baru dari peta"
                backHref="/admin"
            />

            {/* Search Card */}
            <Card className="mb-6">
                <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                        Scraping Otomatis
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Pilih kategori atau masukkan URL Google Maps untuk scraping otomatis semua lokasi.
                    </p>

                    {/* Quick Search Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {SEARCH_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handleScrape(preset.query)}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* URL Input */}
                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Atau paste URL Google Maps Search:
                        </label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://www.google.com/maps/search/pendidikan+ngabul/@-6.647,110.685,14z/..."
                                value={searchUrl}
                                onChange={(e) => setSearchUrl(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                onClick={() => handleScrape()}
                                disabled={isLoading || !searchUrl}
                                variant="primary"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Scraping...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        Scrape
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Custom Query */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Atau ketik kata kunci custom (misal: pondok pesantren)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            onClick={() => handleScrape()}
                            disabled={isLoading || !searchQuery}
                            variant="secondary"
                        >
                            <Search className="w-4 h-4" />
                            Cari
                        </Button>
                    </div>
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

            {/* Loading */}
            {isLoading && (
                <Card className="mb-6">
                    <div className="p-12 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Sedang Scraping...
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Mencari lokasi dari OpenStreetMap dan database peta
                        </p>
                    </div>
                </Card>
            )}

            {/* Results Table */}
            {!isLoading && scrapedLocations.length > 0 && (
                <Card>
                    <CardHeader
                        title={`Hasil Scraping: "${lastQuery}" (${scrapedLocations.length} lokasi)`}
                        action={
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={scrapedLocations.every((loc) => loc.selected)}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4"
                                    />
                                    Pilih Semua
                                </label>
                                {selectedCount > 0 && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
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
                                                Simpan ke Database ({selectedCount})
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        }
                    />
                    <Table>
                        <TableHead>
                            <tr>
                                <TableHeader className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={scrapedLocations.every((loc) => loc.selected)}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4"
                                    />
                                </TableHeader>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>Kategori</TableHeader>
                                <TableHeader>Koordinat</TableHeader>
                                <TableHeader className="text-right">Aksi</TableHeader>
                            </tr>
                        </TableHead>
                        <TableBody>
                            {scrapedLocations.map((loc) => (
                                <TableRow key={loc.id}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={loc.selected}
                                            onChange={() => toggleSelect(loc.id)}
                                            className="h-4 w-4"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            <div>
                                                <div>{loc.name}</div>
                                                <div className="text-xs text-gray-400">{loc.address}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={loc.category}
                                            onChange={(e) => updateCategory(loc.id, e.target.value)}
                                            className="text-xs w-32"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-gray-600">
                                        {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openInGoogleMaps(loc)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Lihat di Google Maps"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeLocation(loc.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && scrapedLocations.length === 0 && !error && (
                <Card>
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Download className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Scraping Otomatis
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Klik tombol kategori di atas untuk mencari semua lokasi secara otomatis,
                            atau paste URL dari Google Maps Search.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
