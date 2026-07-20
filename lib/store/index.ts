"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ChatMessage,
  EnterpriseAccount,
  Match,
  MatchStatus,
  NotificationItem,
  Rating,
  Trip,
  Transaction,
  User,
  VerificationKey,
} from "@/lib/types";
import { buildSeedTrips, buildSeedUsers, CURRENT_USER_ID } from "@/lib/seed/data";
import { estimateCo2SavedKg, estimateEtaMinutes, pointAlongRoute, routeLengthKm } from "@/lib/geo";

export type AuthStep = "phone" | "otp" | "ekyc" | "done";

interface AppState {
  onboardingDone: boolean;
  authStep: AuthStep;
  pendingPhone: string;

  users: Record<string, User>;
  trips: Record<string, Trip>;
  matches: Record<string, Match>;
  transactions: Record<string, Transaction>;
  ratings: Record<string, Rating>;
  messages: ChatMessage[];
  notifications: NotificationItem[];
  enterprise: Record<string, EnterpriseAccount>;

  currentUserId: string;

  // bootstrap
  hydrated: boolean;
  setHydrated: () => void;
  resetDemo: () => void;

  // auth
  completeOnboarding: () => void;
  setPendingPhone: (phone: string) => void;
  goToStep: (step: AuthStep) => void;
  setVerification: (key: VerificationKey, value: boolean) => void;
  registerVehicle: (vehicle: NonNullable<User["vehicle"]>) => void;
  setRoleMode: (mode: User["roleMode"]) => void;

  // trips
  addTrip: (trip: Omit<Trip, "id" | "createdAt" | "status" | "ownerId">) => Trip;
  cancelTrip: (tripId: string) => void;

  // matches
  createMatch: (params: {
    offerTripId: string;
    requestTripId: string;
    overlapPercent: number;
    sharedDistanceKm: number;
  }) => Match;
  setMatchStatus: (matchId: string, status: MatchStatus) => void;
  startTrip: (matchId: string) => void;
  advanceTrip: (matchId: string, progress: number) => void;
  completeTrip: (matchId: string) => void;
  cancelMatch: (matchId: string) => void;

  // wallet
  topUpWallet: (amount: number) => void;

  // chat
  sendMessage: (matchId: string, text: string, senderId?: string) => void;

  // rating
  submitRating: (params: {
    matchId: string;
    fromUserId: string;
    toUserId: string;
    stars: number;
    tags: string[];
    comment?: string;
  }) => void;

  // notifications
  pushNotification: (n: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // subscription
  subscribeCommuterPass: () => void;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// Ước tính: cứ ~17 chuyến đi chung thì giải phóng được 1 chỗ đỗ xe cố định.
// Đây là giả định demo (chưa có khảo sát thực tế), tách riêng thành hằng số
// để dễ thay bằng số liệu thật khi có dữ liệu vận hành.
const TRIPS_PER_PARKING_SPOT = 17;

/** Chia một tổng số thành chuỗi tăng dần theo N mốc (dùng để minh hoạ xu hướng
 * nhiều tháng/tuần từ một tổng tích luỹ hiện có — không phải lịch sử thật, vì
 * hệ thống hiện chưa lưu số liệu theo từng kỳ). Cùng công thức với biểu đồ xu
 * hướng ở trang Tác động cá nhân, để nhất quán trong toàn app. */
function distributeGrowth(total: number, points: number): number[] {
  const weights = Array.from({ length: points }, (_, i) => (i + 1) ** 1.3);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  let cumulative = 0;
  return weights.map((w) => {
    cumulative += (w / sum) * total;
    return Math.round(cumulative * 100) / 100;
  });
}

function lastMonths(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function seedEnterprise(users: Record<string, User>): Record<string, EnterpriseAccount> {
  const byCompany: Record<string, EnterpriseAccount> = {
    "c-fpt": {
      id: "c-fpt",
      companyName: "FPT Software",
      address: "Lô T2, Đường D1, Khu Công nghệ cao, TP. Thủ Đức",
      employees: [],
      monthlyReports: [],
    },
    "c-intel": {
      id: "c-intel",
      companyName: "Intel Products Vietnam",
      address: "Lô I2, Đường D2, Khu Công nghệ cao, TP. Thủ Đức",
      employees: [],
      monthlyReports: [],
    },
  };

  // Cộng dồn CO2/số chuyến/tiền tiết kiệm thật từ chính các nhân viên đã gắn
  // companyId, thay vì số liệu gõ tay cố định.
  const totals: Record<string, { co2: number; trips: number; moneySaved: number }> = {};
  for (const u of Object.values(users)) {
    if (!u.companyId || !byCompany[u.companyId]) continue;
    byCompany[u.companyId].employees.push({
      userId: u.id,
      name: u.name,
      department: u.roleMode === "driver" ? "Kỹ thuật" : "Vận hành",
      tripsThisMonth: u.tripsCount,
      co2SavedKg: u.co2SavedKg,
    });
    const t = (totals[u.companyId] ??= { co2: 0, trips: 0, moneySaved: 0 });
    t.co2 += u.co2SavedKg;
    t.trips += u.tripsCount;
    t.moneySaved += u.moneySaved;
  }

  const months = lastMonths(3);
  for (const companyId of Object.keys(byCompany)) {
    const t = totals[companyId] ?? { co2: 0, trips: 0, moneySaved: 0 };
    const co2Series = distributeGrowth(t.co2, 3);
    const tripsSeries = distributeGrowth(t.trips, 3);
    const moneySeries = distributeGrowth(t.moneySaved, 3);
    byCompany[companyId].monthlyReports = months.map((month, i) => ({
      month,
      co2SavedKg: co2Series[i],
      tripsShared: Math.round(tripsSeries[i]),
      costSavedVnd: Math.round(moneySeries[i]),
      parkingSpotsFreed: Math.max(0, Math.round(tripsSeries[i] / TRIPS_PER_PARKING_SPOT)),
    }));
  }

  return byCompany;
}

function initialState() {
  const users = Object.fromEntries(buildSeedUsers().map((u) => [u.id, u]));
  const trips = Object.fromEntries(buildSeedTrips().map((t) => [t.id, t]));
  return {
    onboardingDone: false,
    authStep: "phone" as AuthStep,
    pendingPhone: "",
    users,
    trips,
    matches: {} as Record<string, Match>,
    transactions: {} as Record<string, Transaction>,
    ratings: {} as Record<string, Rating>,
    messages: [] as ChatMessage[],
    notifications: [] as NotificationItem[],
    enterprise: seedEnterprise(users),
    currentUserId: CURRENT_USER_ID,
    hydrated: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      setHydrated: () => set({ hydrated: true }),
      resetDemo: () => set({ ...initialState(), hydrated: true }),

      completeOnboarding: () => set({ onboardingDone: true }),
      setPendingPhone: (phone) => set({ pendingPhone: phone }),
      goToStep: (step) => set({ authStep: step }),

      setVerification: (key, value) =>
        set((s) => {
          const me = s.users[s.currentUserId];
          if (!me) return s;
          return {
            users: {
              ...s.users,
              [me.id]: { ...me, verified: { ...me.verified, [key]: value } },
            },
          };
        }),

      registerVehicle: (vehicle) =>
        set((s) => {
          const me = s.users[s.currentUserId];
          if (!me) return s;
          return { users: { ...s.users, [me.id]: { ...me, vehicle } } };
        }),

      setRoleMode: (mode) =>
        set((s) => {
          const me = s.users[s.currentUserId];
          if (!me) return s;
          return { users: { ...s.users, [me.id]: { ...me, roleMode: mode } } };
        }),

      addTrip: (trip) => {
        const t: Trip = {
          ...trip,
          id: uid("t"),
          ownerId: get().currentUserId,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ trips: { ...s.trips, [t.id]: t } }));
        return t;
      },

      cancelTrip: (tripId) =>
        set((s) => {
          const t = s.trips[tripId];
          if (!t) return s;
          return { trips: { ...s.trips, [tripId]: { ...t, status: "cancelled" } } };
        }),

      createMatch: ({ offerTripId, requestTripId, overlapPercent, sharedDistanceKm }) => {
        const s = get();
        const offer = s.trips[offerTripId];
        const request = s.trips[requestTripId];
        const match: Match = {
          id: uid("m"),
          offerTripId,
          requestTripId,
          driverId: offer.ownerId,
          riderId: request.ownerId,
          overlapPercent,
          sharedDistanceKm,
          totalPrice: offer.pricePerSeat,
          status: "confirmed",
          createdAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString(),
          progress: 0,
        };
        const fee = Math.round(match.totalPrice * 0.08);
        const tx: Transaction = {
          id: uid("tx"),
          matchId: match.id,
          payerId: match.riderId,
          payeeId: match.driverId,
          amount: match.totalPrice,
          serviceFee: fee,
          status: "held",
          createdAt: new Date().toISOString(),
        };
        set((st) => ({
          matches: { ...st.matches, [match.id]: match },
          transactions: { ...st.transactions, [tx.id]: tx },
          trips: {
            ...st.trips,
            [offerTripId]: { ...st.trips[offerTripId], status: "matched" },
            [requestTripId]: { ...st.trips[requestTripId], status: "matched" },
          },
          users: {
            ...st.users,
            [match.riderId]: {
              ...st.users[match.riderId],
              walletBalance: st.users[match.riderId].walletBalance - match.totalPrice,
            },
          },
        }));
        get().pushNotification({
          title: "Ghép chuyến thành công!",
          body: `Bạn đã ghép chuyến với ${s.users[offer.ownerId === s.currentUserId ? request.ownerId : offer.ownerId]?.name ?? "đối tác"}. Tiền đã được tạm giữ an toàn.`,
          kind: "match",
          link: `/trips/match/${match.id}`,
        });
        return match;
      },

      setMatchStatus: (matchId, status) =>
        set((s) => ({ matches: { ...s.matches, [matchId]: { ...s.matches[matchId], status } } })),

      startTrip: (matchId) =>
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          return {
            matches: { ...s.matches, [matchId]: { ...m, status: "ongoing", progress: 0 } },
            trips: {
              ...s.trips,
              [m.offerTripId]: { ...s.trips[m.offerTripId], status: "ongoing" },
              [m.requestTripId]: { ...s.trips[m.requestTripId], status: "ongoing" },
            },
          };
        }),

      advanceTrip: (matchId, progress) =>
        set((s) => {
          const m = s.matches[matchId];
          if (!m) return s;
          const offer = s.trips[m.offerTripId];
          const pos = pointAlongRoute(offer.route.waypoints, progress);
          const remainingKm = routeLengthKm(offer.route.waypoints) * (1 - progress);
          return {
            matches: {
              ...s.matches,
              [matchId]: {
                ...m,
                progress,
                liveDriverPos: pos,
                etaMinutes: estimateEtaMinutes(remainingKm),
              },
            },
          };
        }),

      completeTrip: (matchId) => {
        const s = get();
        const m = s.matches[matchId];
        if (!m) return;
        const tx = Object.values(s.transactions).find((t) => t.matchId === matchId);
        const co2 = estimateCo2SavedKg(m.sharedDistanceKm);
        set((st) => ({
          matches: { ...st.matches, [matchId]: { ...m, status: "completed", completedAt: new Date().toISOString(), progress: 1 } },
          trips: {
            ...st.trips,
            [m.offerTripId]: { ...st.trips[m.offerTripId], status: "completed" },
            [m.requestTripId]: { ...st.trips[m.requestTripId], status: "completed" },
          },
          transactions: tx
            ? { ...st.transactions, [tx.id]: { ...tx, status: "released", releasedAt: new Date().toISOString() } }
            : st.transactions,
          users: {
            ...st.users,
            [m.driverId]: {
              ...st.users[m.driverId],
              walletBalance: st.users[m.driverId].walletBalance + (tx ? tx.amount - tx.serviceFee : 0),
              tripsCount: st.users[m.driverId].tripsCount + 1,
              co2SavedKg: Math.round((st.users[m.driverId].co2SavedKg + co2) * 100) / 100,
            },
            [m.riderId]: {
              ...st.users[m.riderId],
              tripsCount: st.users[m.riderId].tripsCount + 1,
              moneySaved: st.users[m.riderId].moneySaved + Math.round(m.totalPrice * 0.35),
              co2SavedKg: Math.round((st.users[m.riderId].co2SavedKg + co2) * 100) / 100,
            },
          },
        }));
        get().pushNotification({
          title: "Chuyến đi hoàn tất",
          body: "Cảm ơn bạn đã đồng hành cùng CoGo. Hãy đánh giá chuyến đi nhé!",
          kind: "trip",
          link: `/trips/match/${matchId}/rate`,
        });
      },

      cancelMatch: (matchId) => {
        const s = get();
        const m = s.matches[matchId];
        if (!m) return;
        const tx = Object.values(s.transactions).find((t) => t.matchId === matchId);
        set((st) => ({
          matches: { ...st.matches, [matchId]: { ...m, status: "cancelled" } },
          trips: {
            ...st.trips,
            [m.offerTripId]: { ...st.trips[m.offerTripId], status: "open" },
            [m.requestTripId]: { ...st.trips[m.requestTripId], status: "open" },
          },
          transactions: tx
            ? { ...st.transactions, [tx.id]: { ...tx, status: "refunded" } }
            : st.transactions,
          users: {
            ...st.users,
            [m.riderId]: {
              ...st.users[m.riderId],
              walletBalance: st.users[m.riderId].walletBalance + m.totalPrice,
            },
          },
        }));
        get().pushNotification({
          title: "Chuyến đi đã huỷ",
          body: "Khoản tiền tạm giữ đã được hoàn lại vào ví của bạn.",
          kind: "payment",
        });
      },

      topUpWallet: (amount) =>
        set((s) => ({
          users: {
            ...s.users,
            [s.currentUserId]: {
              ...s.users[s.currentUserId],
              walletBalance: s.users[s.currentUserId].walletBalance + amount,
            },
          },
        })),

      sendMessage: (matchId, text, senderId) =>
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: uid("msg"),
              matchId,
              senderId: senderId ?? s.currentUserId,
              text,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      submitRating: ({ matchId, fromUserId, toUserId, stars, tags, comment }) =>
        set((s) => {
          const rating: Rating = {
            id: uid("r"),
            matchId,
            fromUserId,
            toUserId,
            stars,
            tags,
            comment,
            createdAt: new Date().toISOString(),
          };
          const target = s.users[toUserId];
          const newCount = target.ratingCount + 1;
          const newAvg = Math.round(((target.ratingAvg * target.ratingCount + stars) / newCount) * 100) / 100;
          return {
            ratings: { ...s.ratings, [rating.id]: rating },
            users: {
              ...s.users,
              [toUserId]: { ...target, ratingAvg: newAvg, ratingCount: newCount },
            },
          };
        }),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: uid("n"),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      subscribeCommuterPass: () =>
        set((s) => ({
          users: {
            ...s.users,
            [s.currentUserId]: { ...s.users[s.currentUserId], subscription: "commuter-pass" },
          },
        })),
    }),
    {
      name: "cogo-demo-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

export function useCurrentUser() {
  return useAppStore((s) => s.users[s.currentUserId]);
}
