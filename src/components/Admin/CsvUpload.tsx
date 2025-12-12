"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

interface CsvUploadProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function CsvUpload({ onUpload, disabled }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await onUpload(file);
    } finally {
      setUploading(false);
      // reset input so the same file can be selected again if needed
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        disabled={disabled || uploading}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4" />
        {uploading ? "Mengunggah..." : "Upload CSV"}
      </button>
      <span className="text-xs text-gray-500">
        Format: name, coordinates(lat,lng), category_name, subcategory_name, address, dusun, contact, condition, description, images(|)
      </span>
    </div>
  );
}

