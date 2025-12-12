"use client";

interface GoogleMapEmbedProps {
  lat: number;
  lng: number;
  zoom?: number;
}

// Simple Google Maps iframe (no API key) to embed a base map.
export function GoogleMapEmbed({ lat, lng, zoom = 14 }: GoogleMapEmbedProps) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <iframe
      title="Google Maps Embed"
      src={src}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

