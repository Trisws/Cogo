"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "@/lib/types";

export interface MapRoute {
  waypoints: LatLng[];
  color: string;
  weight?: number;
  dashed?: boolean;
  opacity?: number;
}

export interface MapMarker {
  pos: LatLng;
  color?: string;
  label?: string;
  kind?: "pin" | "dot" | "avatar";
  avatarUrl?: string;
}

function divIcon(marker: MapMarker) {
  const color = marker.color ?? "#1f8a53";
  if (marker.kind === "avatar" && marker.avatarUrl) {
    return L.divIcon({
      className: "",
      html: `<div style="width:34px;height:34px;border-radius:9999px;border:2.5px solid ${color};background:#fff;background-image:url('${marker.avatarUrl}');background-size:cover;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
  if (marker.kind === "dot") {
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,.3);border:2px solid white"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [36, 36] });
  }, [map, points]);
  return null;
}

export function LeafletMap({
  routes = [],
  markers = [],
  height = "100%",
  className,
  interactive = true,
  fitToContent = true,
  center,
  zoom = 14,
}: {
  routes?: MapRoute[];
  markers?: MapMarker[];
  height?: string;
  className?: string;
  interactive?: boolean;
  fitToContent?: boolean;
  center?: LatLng;
  zoom?: number;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const allPoints = useMemo(
    () => [...routes.flatMap((r) => r.waypoints), ...markers.map((m) => m.pos)],
    [routes, markers]
  );
  const initialCenter = center ?? allPoints[0] ?? { lat: 10.7769, lng: 106.7009 };

  return (
    <div style={{ height }} className={className}>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        {routes.map((r, i) => (
          <Polyline
            key={i}
            positions={r.waypoints.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: r.color,
              weight: r.weight ?? 5,
              opacity: r.opacity ?? 0.9,
              dashArray: r.dashed ? "1 10" : undefined,
              lineCap: "round",
            }}
          />
        ))}
        {markers.map((m, i) => (
          <Marker key={i} position={[m.pos.lat, m.pos.lng]} icon={divIcon(m)} />
        ))}
        {fitToContent && allPoints.length > 0 && !center && <FitBounds points={allPoints} />}
      </MapContainer>
    </div>
  );
}
