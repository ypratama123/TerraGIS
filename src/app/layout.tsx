import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SIG Desa Ngabul Jepara",
  description: "Sistem Informasi Geografis untuk memetakan infrastruktur dan fasilitas publik di Desa Ngabul Jepara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        <div className="min-h-screen w-screen overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
