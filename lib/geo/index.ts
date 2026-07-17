import * as turf from "@turf/turf";
import type { LatLng } from "@/lib/types";

const toPoint = (p: LatLng) => turf.point([p.lng, p.lat]);
const toLine = (pts: LatLng[]) => turf.lineString(pts.map((p) => [p.lng, p.lat]));

/** Great-circle distance in km between two points. */
export function haversineKm(a: LatLng, b: LatLng): number {
  return turf.distance(toPoint(a), toPoint(b), { units: "kilometers" });
}

/** Total length of a polyline in km. */
export function routeLengthKm(waypoints: LatLng[]): number {
  if (waypoints.length < 2) return 0;
  return turf.length(toLine(waypoints), { units: "kilometers" });
}

/**
 * Approximate route-similarity used by the MVP matching engine.
 *
 * The full CoGo vision uses Fréchet Distance + Spatial Longest Common
 * Subsequence to compare trajectories. For the MVP we approximate that with
 * a buffer-intersection heuristic: buffer route A by a corridor width, clip
 * route B against it, and measure what share of B's length falls inside the
 * corridor (and vice versa). This captures "how much of the two routes run
 * along the same corridor" without needing a full trajectory-similarity
 * implementation, matching the doc's own MVP-vs-advanced staging.
 */
export function routeOverlapPercent(
  routeA: LatLng[],
  routeB: LatLng[],
  corridorMeters = 350
): { overlapPercent: number; sharedDistanceKm: number } {
  if (routeA.length < 2 || routeB.length < 2) {
    return { overlapPercent: 0, sharedDistanceKm: 0 };
  }
  try {
    const lineA = toLine(routeA);
    const lineB = toLine(routeB);
    const bufferA = turf.buffer(lineA, corridorMeters, { units: "meters" });
    const bufferB = turf.buffer(lineB, corridorMeters, { units: "meters" });
    if (!bufferA || !bufferB) return { overlapPercent: 0, sharedDistanceKm: 0 };

    const clippedBinA = turf.intersect(turf.featureCollection([bufferA, bufferB]));
    let sharedDistanceKm = 0;
    if (clippedBinA) {
      // Sample line B, count segment lengths whose midpoint sits in the overlap zone.
      const coords = lineB.geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        const mid = turf.midpoint(turf.point(coords[i]), turf.point(coords[i + 1]));
        if (turf.booleanPointInPolygon(mid, clippedBinA)) {
          sharedDistanceKm += turf.distance(
            turf.point(coords[i]),
            turf.point(coords[i + 1]),
            { units: "kilometers" }
          );
        }
      }
    }

    const lenA = routeLengthKm(routeA);
    const lenB = routeLengthKm(routeB);
    const shorter = Math.min(lenA, lenB) || 1;
    const overlapPercent = Math.max(0, Math.min(1, sharedDistanceKm / shorter));
    return { overlapPercent, sharedDistanceKm };
  } catch {
    return { overlapPercent: 0, sharedDistanceKm: 0 };
  }
}

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

const HCMC_VIEWBOX = "106.55,10.9,106.85,10.68";

/** Free OSM Nominatim geocoding, biased to HCMC. Falls back to [] on error. */
export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 3) return [];
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "vn");
    url.searchParams.set("viewbox", HCMC_VIEWBOX);
    url.searchParams.set("bounded", "0");
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data: { display_name: string; lat: string; lon: string }[] = await res.json();
    return data.map((d) => ({
      label: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }));
  } catch {
    return [];
  }
}

/**
 * Road-snapped route via the public OSRM demo server. Falls back to a
 * straight line (with a couple of interpolated points) if the request fails
 * or is rate-limited, so the UI always has something to draw.
 */
export async function fetchRoute(origin: LatLng, destination: LatLng): Promise<LatLng[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("osrm failed");
    const data = await res.json();
    const coords: [number, number][] | undefined = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords || coords.length < 2) throw new Error("no route");
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return straightLineRoute(origin, destination);
  }
}

export function straightLineRoute(origin: LatLng, destination: LatLng, steps = 6): LatLng[] {
  const pts: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      lat: origin.lat + (destination.lat - origin.lat) * t,
      lng: origin.lng + (destination.lng - origin.lng) * t,
    });
  }
  return pts;
}

export function pointAlongRoute(waypoints: LatLng[], progress: number): LatLng {
  if (waypoints.length === 0) return { lat: 0, lng: 0 };
  if (waypoints.length === 1) return waypoints[0];
  const line = toLine(waypoints);
  const total = turf.length(line, { units: "kilometers" });
  const along = turf.along(line, total * Math.max(0, Math.min(1, progress)), {
    units: "kilometers",
  });
  const [lng, lat] = along.geometry.coordinates;
  return { lat, lng };
}

export function estimateEtaMinutes(distanceKm: number, avgSpeedKmh = 26): number {
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

export function estimateCo2SavedKg(sharedDistanceKm: number): number {
  // ~90g CO2/km avoided per passenger removed from a separate motorbike trip.
  return Math.round(sharedDistanceKm * 0.09 * 100) / 100;
}
