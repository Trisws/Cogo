export type VerificationKey = "phone" | "email" | "student" | "cccd" | "license";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Vehicle {
  type: "motorbike" | "car";
  brand: string;
  model: string;
  plate: string;
  color: string;
  seats: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email?: string;
  gender: "male" | "female" | "other";
  bio?: string;
  company?: string;
  verified: Record<VerificationKey, boolean>;
  trustScore: number; // 0-100
  roleMode: "rider" | "driver";
  vehicle?: Vehicle;
  walletBalance: number;
  moneySaved: number;
  co2SavedKg: number;
  tripsCount: number;
  ratingAvg: number;
  ratingCount: number;
  subscription?: "none" | "commuter-pass";
  companyId?: string;
}

export type TripKind = "offer" | "request";
export type TripStatus = "open" | "matched" | "ongoing" | "completed" | "cancelled";

export interface RoutePlan {
  origin: LatLng & { label: string };
  destination: LatLng & { label: string };
  waypoints: LatLng[]; // road-snapped polyline (incl origin/destination)
  distanceKm: number;
}

export interface Trip {
  id: string;
  ownerId: string;
  kind: TripKind;
  route: RoutePlan;
  departAt: string; // ISO
  recurring: "once" | "daily" | "weekdays";
  seats: number; // seats offered / needed
  pricePerSeat: number; // VND
  detourTolerance: number; // 0-1
  status: TripStatus;
  createdAt: string;
}

export type MatchStatus =
  | "suggested"
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Match {
  id: string;
  offerTripId: string;
  requestTripId: string;
  driverId: string;
  riderId: string;
  overlapPercent: number;
  sharedDistanceKm: number;
  totalPrice: number;
  status: MatchStatus;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  liveDriverPos?: LatLng;
  etaMinutes?: number;
  progress?: number; // 0-1 along the shared route, used by the tracking screen
}

export type TxStatus = "held" | "released" | "refunded";

export interface Transaction {
  id: string;
  matchId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  serviceFee: number;
  status: TxStatus;
  createdAt: string;
  releasedAt?: string;
}

export interface Rating {
  id: string;
  matchId: string;
  fromUserId: string;
  toUserId: string;
  stars: number;
  tags: string[];
  comment?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: "match" | "trip" | "payment" | "system" | "rating";
  link?: string;
}

export interface EnterpriseEmployee {
  userId: string;
  name: string;
  department: string;
  tripsThisMonth: number;
  co2SavedKg: number;
}

export interface EnterpriseAccount {
  id: string;
  companyName: string;
  address: string;
  employees: EnterpriseEmployee[];
  monthlyReports: {
    month: string;
    co2SavedKg: number;
    tripsShared: number;
    costSavedVnd: number;
    parkingSpotsFreed: number;
  }[];
}
