"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LocationReport } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Phone,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<LocationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("location_reports")
        .select("*, locations(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data || []) as LocationReport[]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status: LocationReport["status"]) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return "Menunggu";
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: LocationReport["status"]
  ) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("location_reports")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Gagal memperbarui status laporan.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

    try {
      const { error } = await supabase
        .from("location_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Gagal menghapus laporan.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Masuk</h1>
            <p className="text-sm text-gray-500">
              Daftar laporan pembaruan dari pengunjung
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat laporan...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Belum ada laporan
            </h3>
            <p className="text-gray-500 mt-1">
              Belum ada pengunjung yang mengirimkan laporan pembaruan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {/* @ts-ignore - Supabase join returns object */}
                    {report.locations?.name || "Lokasi Baru / Tidak Diketahui"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    Kondisi:{" "}
                    <span className="font-medium">{report.condition}</span>
                  </p>

                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex items-start gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.full_name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {report.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      {report.phone}
                    </div>
                  </div>

                  {report.description && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic">
                      "{report.description}"
                    </div>
                  )}

                  {report.image_url && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <a
                        href={report.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lihat Foto Bukti
                      </a>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(report.id, "approved")}
                      disabled={updatingId === report.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Setujui
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(report.id, "rejected")}
                      disabled={updatingId === report.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-3 h-3" />
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(report.id, "pending")}
                      disabled={updatingId === report.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Kembalikan ke Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(report.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-red-700 border border-red-200 hover:bg-red-50 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
