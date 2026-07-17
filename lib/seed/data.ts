import type { RoutePlan, Trip, User } from "@/lib/types";
import { routeLengthKm } from "@/lib/geo";

// Hand-picked via-points along real HCMC corridors so the demo matching
// engine produces realistic, non-random overlap percentages.
const ROUTES: Record<string, { origin: string; destination: string; pts: [number, number][] }> = {
  thuDuc_benThanh: {
    origin: "Vinhomes Grand Park, TP. Thủ Đức",
    destination: "Chợ Bến Thành, Quận 1",
    pts: [
      [10.8412, 106.8339],
      [10.85, 106.781],
      [10.8028, 106.7305],
      [10.7953, 106.7218],
      [10.783, 106.704],
      [10.7725, 106.698],
    ],
  },
  dhqg_q3: {
    origin: "Đại học Quốc gia, TP. Thủ Đức",
    destination: "Cách Mạng Tháng 8, Quận 3",
    pts: [
      [10.87, 106.803],
      [10.85, 106.781],
      [10.8028, 106.7305],
      [10.7953, 106.7218],
      [10.783, 106.704],
      [10.769, 106.695],
    ],
  },
  thuDuc_q1_alt: {
    origin: "Khu CNC, TP. Thủ Đức",
    destination: "Nhà thờ Đức Bà, Quận 1",
    pts: [
      [10.841, 106.809],
      [10.85, 106.781],
      [10.8028, 106.7305],
      [10.7953, 106.7218],
      [10.7802, 106.6995],
    ],
  },
  phuMyHung_benThanh: {
    origin: "Phú Mỹ Hưng, Quận 7",
    destination: "Chợ Bến Thành, Quận 1",
    pts: [
      [10.7297, 106.7188],
      [10.742, 106.705],
      [10.755, 106.701],
      [10.768, 106.6975],
      [10.7725, 106.698],
    ],
  },
  q7_alt_q1: {
    origin: "Him Lam, Quận 7",
    destination: "Bitexco, Quận 1",
    pts: [
      [10.725, 106.71],
      [10.742, 106.705],
      [10.755, 106.701],
      [10.768, 106.6975],
      [10.77, 106.6997],
    ],
  },
  binhThanh_q1: {
    origin: "Landmark 81, Bình Thạnh",
    destination: "Chợ Bến Thành, Quận 1",
    pts: [
      [10.801, 106.715],
      [10.7953, 106.7218],
      [10.783, 106.704],
      [10.7725, 106.698],
    ],
  },
  tanBinh_q1: {
    origin: "Sân bay Tân Sơn Nhất, Tân Bình",
    destination: "Chợ Bến Thành, Quận 1",
    pts: [
      [10.8014, 106.6583],
      [10.79, 106.665],
      [10.78, 106.68],
      [10.7725, 106.698],
    ],
  },
};

function makeRoute(key: keyof typeof ROUTES): RoutePlan {
  const r = ROUTES[key];
  const waypoints = r.pts.map(([lat, lng]) => ({ lat, lng }));
  return {
    origin: { ...waypoints[0], label: r.origin },
    destination: { ...waypoints[waypoints.length - 1], label: r.destination },
    waypoints,
    distanceKm: Math.round(routeLengthKm(waypoints) * 10) / 10,
  };
}

const AVATAR = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`;

export const CURRENT_USER_ID = "u-you";

export function buildSeedUsers(): User[] {
  const base: Omit<User, "verified" | "avatar">[] = [
    {
      id: CURRENT_USER_ID,
      name: "Bạn",
      phone: "0901234567",
      gender: "other",
      trustScore: 78,
      roleMode: "rider",
      walletBalance: 250000,
      moneySaved: 0,
      co2SavedKg: 0,
      tripsCount: 0,
      ratingAvg: 5,
      ratingCount: 0,
      subscription: "none",
    },
    {
      id: "u-han",
      name: "Hoàng Bảo Hân",
      phone: "0908111222",
      gender: "female",
      trustScore: 96,
      roleMode: "driver",
      vehicle: { type: "car", brand: "Toyota", model: "Vios", plate: "51K-889.20", color: "Trắng", seats: 4 },
      walletBalance: 620000,
      moneySaved: 1240000,
      co2SavedKg: 18.4,
      tripsCount: 42,
      ratingAvg: 4.9,
      ratingCount: 40,
      company: "FPT Software",
      companyId: "c-fpt",
    },
    {
      id: "u-nho",
      name: "Thái Trung Nhớ",
      phone: "0908222333",
      gender: "male",
      trustScore: 91,
      roleMode: "driver",
      vehicle: { type: "motorbike", brand: "Honda", model: "SH", plate: "59P1-234.56", color: "Đen", seats: 1 },
      walletBalance: 340000,
      moneySaved: 860000,
      co2SavedKg: 11.2,
      tripsCount: 27,
      ratingAvg: 4.8,
      ratingCount: 25,
      company: "FPT Software",
      companyId: "c-fpt",
    },
    {
      id: "u-huy",
      name: "Đinh Quốc Huy",
      phone: "0908333444",
      gender: "male",
      trustScore: 88,
      roleMode: "rider",
      walletBalance: 180000,
      moneySaved: 540000,
      co2SavedKg: 7.6,
      tripsCount: 19,
      ratingAvg: 4.7,
      ratingCount: 18,
    },
    {
      id: "u-tri",
      name: "Nguyễn Trần Minh Trí",
      phone: "0908444555",
      gender: "male",
      trustScore: 93,
      roleMode: "driver",
      vehicle: { type: "car", brand: "Kia", model: "Morning", plate: "51G-112.34", color: "Xanh", seats: 4 },
      walletBalance: 410000,
      moneySaved: 990000,
      co2SavedKg: 14.1,
      tripsCount: 31,
      ratingAvg: 4.85,
      ratingCount: 29,
    },
    {
      id: "u-linh",
      name: "Phạm Thùy Linh",
      phone: "0908555666",
      gender: "female",
      trustScore: 85,
      roleMode: "rider",
      walletBalance: 120000,
      moneySaved: 320000,
      co2SavedKg: 4.9,
      tripsCount: 12,
      ratingAvg: 4.6,
      ratingCount: 11,
      company: "Intel Vietnam",
      companyId: "c-intel",
    },
    {
      id: "u-khoa",
      name: "Lê Anh Khoa",
      phone: "0908666777",
      gender: "male",
      trustScore: 90,
      roleMode: "driver",
      vehicle: { type: "motorbike", brand: "Yamaha", model: "NVX", plate: "59V1-556.78", color: "Xám", seats: 1 },
      walletBalance: 275000,
      moneySaved: 710000,
      co2SavedKg: 9.3,
      tripsCount: 22,
      ratingAvg: 4.75,
      ratingCount: 20,
      company: "Intel Vietnam",
      companyId: "c-intel",
    },
    {
      id: "u-mai",
      name: "Đỗ Ngọc Mai",
      phone: "0908777888",
      gender: "female",
      trustScore: 82,
      roleMode: "rider",
      walletBalance: 95000,
      moneySaved: 210000,
      co2SavedKg: 3.1,
      tripsCount: 7,
      ratingAvg: 4.5,
      ratingCount: 6,
    },
  ];

  return base.map((u) => ({
    ...u,
    avatar: AVATAR(u.id),
    verified: {
      phone: true,
      email: u.id !== "u-mai",
      student: false,
      cccd: u.id !== CURRENT_USER_ID && u.id !== "u-mai",
      license: u.roleMode === "driver",
    },
  }));
}

interface SeedTripSpec {
  ownerId: string;
  routeKey: keyof typeof ROUTES;
  kind: Trip["kind"];
  hour: number;
  minute: number;
  seats: number;
  ratePerKm: number;
  detour: number;
  recurring: Trip["recurring"];
}

const SPECS: SeedTripSpec[] = [
  { ownerId: "u-han", routeKey: "thuDuc_benThanh", kind: "offer", hour: 7, minute: 30, seats: 3, ratePerKm: 3200, detour: 0.2, recurring: "weekdays" },
  { ownerId: "u-nho", routeKey: "dhqg_q3", kind: "offer", hour: 7, minute: 15, seats: 1, ratePerKm: 2800, detour: 0.15, recurring: "weekdays" },
  { ownerId: "u-tri", routeKey: "thuDuc_q1_alt", kind: "offer", hour: 7, minute: 45, seats: 3, ratePerKm: 3000, detour: 0.25, recurring: "daily" },
  { ownerId: "u-khoa", routeKey: "phuMyHung_benThanh", kind: "offer", hour: 7, minute: 20, seats: 1, ratePerKm: 2900, detour: 0.2, recurring: "weekdays" },
  { ownerId: "u-huy", routeKey: "q7_alt_q1", kind: "request", hour: 7, minute: 25, seats: 1, ratePerKm: 2900, detour: 0.3, recurring: "weekdays" },
  { ownerId: "u-linh", routeKey: "binhThanh_q1", kind: "request", hour: 7, minute: 40, seats: 1, ratePerKm: 3000, detour: 0.2, recurring: "weekdays" },
  { ownerId: "u-mai", routeKey: "tanBinh_q1", kind: "request", hour: 8, minute: 0, seats: 1, ratePerKm: 3100, detour: 0.15, recurring: "once" },
];

function nextDepart(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export function buildSeedTrips(): Trip[] {
  return SPECS.map((s, i) => {
    const route = makeRoute(s.routeKey);
    return {
      id: `t-seed-${i}`,
      ownerId: s.ownerId,
      kind: s.kind,
      route,
      departAt: nextDepart(s.hour, s.minute),
      recurring: s.recurring,
      seats: s.seats,
      pricePerSeat: Math.round((route.distanceKm * s.ratePerKm) / 1000) * 1000,
      detourTolerance: s.detour,
      status: "open",
      createdAt: new Date().toISOString(),
    };
  });
}

export { ROUTES, makeRoute };
