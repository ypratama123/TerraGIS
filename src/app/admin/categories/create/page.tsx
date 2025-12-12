"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Save } from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  LinkButton,
  FormField,
  Input,
} from "@/components/Admin";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("categories").insert([
        {
          name: formData.name,
          icon: formData.icon || null,
        },
      ]);

      if (error) throw error;

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Gagal menambahkan kategori.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tambah Kategori Baru"
        description="Buat kategori baru untuk pengelompokan lokasi."
        backHref="/admin/categories"
      />

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField label="Nama Kategori" required>
            <Input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Pendidikan"
            />
          </FormField>

          <FormField
            label="Icon"
            hint="Gunakan nama icon dari library Lucide React."
          >
            <Input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Contoh: school"
            />
          </FormField>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <LinkButton href="/admin/categories" variant="secondary">
              Batal
            </LinkButton>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
