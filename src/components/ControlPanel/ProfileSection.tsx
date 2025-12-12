"use client";

import { TriangleAlert, Shield, LogIn, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ProfileSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const hasAdminCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .some((c) => c.startsWith("admin_auth=") && c.includes("1"));

      setIsAdmin(hasAdminCookie);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="text-xs text-gray-500">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        {isAdmin ? (
          <>
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-gray-900">
              Status: Admin
            </span>
          </>
        ) : (
          <>
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">
              Status: Pengunjung
            </span>
          </>
        )}
      </div>

      <div className="space-y-3">
        {!isAdmin && (
          <Link
            href="/report"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <TriangleAlert className="w-3.5 h-3.5" />
            <span>Lapor Pembaruan</span>
          </Link>
        )}

        <Link
          href={isAdmin ? "/admin" : "/login"}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 ${isAdmin
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } text-xs font-medium rounded-lg transition-colors shadow-sm`}
        >
          {isAdmin ? (
            <>
              <Shield className="w-3.5 h-3.5" />
              <span>Dashboard Admin</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk ke Admin</span>
            </>
          )}
        </Link>

        {isAdmin && (
          <a
            href="/api/logout"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 rotate-180" />
            <span>Keluar Admin</span>
          </a>
        )}
      </div>
    </div>
  );
};
