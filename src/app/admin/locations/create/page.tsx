"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Save } from "lucide-react";
import {
  PageHeader,
  Card,
  LocationForm,
  defaultLocationFormValues,
  LocationFormValues,
  LocationFormCategory,
} from "@/components/Admin";
import { CsvUpload } from "@/components/Admin/CsvUpload";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

export default function CreateLocationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*, subcategories(*)");

    if (error) throw error;
    return (data || []) as LocationFormCategory[];
  }, []);

  const { data: categoriesData } =
    useSupabaseQuery<LocationFormCategory[]>(fetchCategories);
  const categories = categoriesData || [];

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        const next = line[i + 1];
        if (inQuotes && next === '"') {
          // escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCoordinates = (value: string | undefined) => {
    if (!value) return { lat: NaN, lng: NaN };
    const cleaned = value.replace(/[^\d\-\.,\s]/g, "");
    const parts = cleaned.includes(",")
      ? cleaned.split(",")
      : cleaned.split(/\s+/);
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return { lat, lng };
  };

  const parseCsv = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];

    const headerCols = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const hasHeader =
      headerCols.includes("name") &&
      (headerCols.includes("coordinates") ||
        headerCols.includes("latitude") ||
        headerCols.includes("longitude"));
    const startIndex = hasHeader ? 1 : 0;

    const rows = lines.slice(startIndex).map((line) => {
      const cols = parseCsvLine(line);
      const map = (key: string) => {
        const idx = headerCols.indexOf(key);
        if (hasHeader && idx >= 0) return cols[idx];
        return undefined;
      };

      const name = hasHeader ? map("name") : cols[0];
      const coordinates = hasHeader ? map("coordinates") : undefined;
      const latitude = hasHeader ? map("latitude") : cols[1];
      const longitude = hasHeader ? map("longitude") : cols[2];
      const category_name = hasHeader ? map("category_name") : cols[3];
      const subcategory_name = hasHeader ? map("subcategory_name") : cols[4];
      const address = hasHeader ? map("address") : cols[5];
      const dusun = hasHeader ? map("dusun") : cols[6];
      const contact = hasHeader ? map("contact") : cols[7];
      const condition = hasHeader ? map("condition") : cols[8];
      const description = hasHeader ? map("description") : cols[9];
      const images = hasHeader ? map("images") : cols[10];

      let lat = parseFloat(latitude || "");
      let lng = parseFloat(longitude || "");
      if (isNaN(lat) || isNaN(lng)) {
        const parsed = parseCoordinates(coordinates);
        lat = parsed.lat;
        lng = parsed.lng;
      }

      return {
        name,
        latitude: lat,
        longitude: lng,
        category_name,
        subcategory_name,
        address,
        dusun,
        contact,
        condition,
        description,
        images: images
          ? images
              .split("|")
              .map((x) => x.trim())
              .filter(Boolean)
          : [],
      };
    });
    return rows;
  };

  const getOrCreateCategory = async (name?: string | null) => {
    if (!name) return null;
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("name", name)
      .single();
    if (data?.id) return data.id;
    const { data: created, error: createError } = await supabase
      .from("categories")
      .insert([{ name }])
      .select("id")
      .single();
    if (createError) throw createError;
    return created?.id ?? null;
  };

  const getOrCreateSubcategory = async (
    categoryId: string | null,
    name?: string | null
  ) => {
    if (!name || !categoryId) return null;
    const { data } = await supabase
      .from("subcategories")
      .select("id")
      .eq("name", name)
      .eq("category_id", categoryId)
      .single();
    if (data?.id) return data.id;
    const { data: created, error: createError } = await supabase
      .from("subcategories")
      .insert([{ name, category_id: categoryId }])
      .select("id")
      .single();
    if (createError) throw createError;
    return created?.id ?? null;
  };

  const handleCsvUpload = async (file: File) => {
    setUploadingCsv(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) {
        alert("CSV kosong atau format tidak dikenali.");
        return;
      }

      for (const row of rows) {
        const categoryId = await getOrCreateCategory(row.category_name);
        const subcategoryId = await getOrCreateSubcategory(
          categoryId,
          row.subcategory_name
        );

        const { data: locationData, error: locationError } = await supabase
          .from("locations")
          .insert([
            {
              name: row.name,
              category_id: categoryId,
              subcategory_id: subcategoryId,
              latitude: row.latitude,
              longitude: row.longitude,
              address: row.address,
              dusun: row.dusun,
              contact: row.contact,
              condition: row.condition,
              description: row.description,
            },
          ])
          .select()
          .single();

        if (locationError) throw locationError;

        if (row.images?.length && locationData) {
          const inserts = row.images.map((url: string) => ({
            location_id: locationData.id,
            image_url: url,
          }));
          const { error: imgErr } = await supabase
            .from("location_images")
            .insert(inserts);
          if (imgErr) throw imgErr;
        }
      }

      alert(`Berhasil mengunggah ${rows.length} lokasi dari CSV.`);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("CSV upload error:", error);
      alert("Gagal mengunggah CSV. Pastikan format sudah benar.");
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleSubmit = async (values: LocationFormValues) => {
    setSubmitting(true);

    try {
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .insert([
          {
            name: values.name,
            category_id: values.category_id || null,
            subcategory_id: values.subcategory_id || null,
            latitude: parseFloat(values.latitude),
            longitude: parseFloat(values.longitude),
            address: values.address,
            dusun: values.dusun,
            contact: values.contact,
            description: values.description,
            condition: values.condition,
          },
        ])
        .select()
        .single();

      if (locationError) throw locationError;

      if (values.images.length > 0 && locationData) {
        const imageInserts = values.images.map((url) => ({
          location_id: locationData.id,
          image_url: url,
        }));

        const { error: imagesError } = await supabase
          .from("location_images")
          .insert(imageInserts);

        if (imagesError) throw imagesError;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Gagal menambahkan lokasi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tambah Lokasi Baru"
        description="Isi formulir di bawah untuk menambahkan data lokasi."
        backHref="/admin"
      />

      <Card className="max-w-3xl">
        <div className="p-5 border-b border-gray-100">
          <CsvUpload onUpload={handleCsvUpload} disabled={submitting || uploadingCsv} />
        </div>
        <LocationForm
          initialValues={defaultLocationFormValues}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Simpan Lokasi"
          submittingLabel="Menyimpan..."
          submitIcon={<Save className="w-4 h-4" />}
          cancelHref="/admin"
          manageCategoriesHref="/admin/categories"
        />
      </Card>
    </div>
  );
}
