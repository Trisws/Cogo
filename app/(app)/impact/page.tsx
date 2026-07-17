"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Leaf, TreePine, Wallet, Zap } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { useCurrentUser } from "@/lib/store";

function buildTrend(total: number, points = 6) {
  const weights = Array.from({ length: points }, (_, i) => (i + 1) ** 1.4);
  const sum = weights.reduce((a, b) => a + b, 0);
  let cumulative = 0;
  return weights.map((w, i) => {
    cumulative += (w / sum) * total;
    return { week: `T${i + 1}`, value: Math.round(cumulative * 100) / 100 };
  });
}

export default function ImpactPage() {
  const me = useCurrentUser();
  const co2Trend = useMemo(() => buildTrend(Math.max(me.co2SavedKg, 1)), [me.co2SavedKg]);
  const moneyTrend = useMemo(() => buildTrend(Math.max(me.moneySaved, 1)), [me.moneySaved]);
  const treesEquivalent = Math.max(1, Math.round(me.co2SavedKg / 21));

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Tác động của bạn" />

      <div className="space-y-5 px-4 py-4">
        <div className="rounded-3xl bg-gradient-to-br from-brand-green to-brand-green-dark p-5 text-primary-foreground">
          <p className="flex items-center gap-1.5 text-xs opacity-90">
            <Leaf className="size-3.5" /> Tổng CO₂ đã cắt giảm
          </p>
          <p className="mt-1 text-3xl font-bold">{me.co2SavedKg.toFixed(1)} kg</p>
          <p className="mt-1 text-xs opacity-80">Tương đương {treesEquivalent} cây xanh hấp thụ trong 1 tháng</p>
          <div className="mt-3 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={co2Trend} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="co2Fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 12, border: "none" }}
                  formatter={(v) => [`${v} kg`, "CO₂"]}
                />
                <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} fill="url(#co2Fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Wallet} label="Tiền tiết kiệm" value={`${me.moneySaved.toLocaleString("vi-VN")}đ`} />
          <StatCard icon={Zap} label="Chuyến đi chung" value={`${me.tripsCount}`} />
        </div>

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Xu hướng tiết kiệm chi phí (6 tuần)</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moneyTrend} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="moneyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--brand-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 12 }}
                  formatter={(v) => [`${Number(v).toLocaleString("vi-VN")}đ`, "Tiết kiệm"]}
                />
                <Area type="monotone" dataKey="value" stroke="var(--brand-blue)" strokeWidth={2} fill="url(#moneyFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4">
          <TreePine className="size-5 shrink-0 text-brand-green" />
          <p className="text-xs text-muted-foreground">
            CoGo tính lượng CO₂ cắt giảm dựa trên quãng đường lộ trình trùng nhau giữa các chuyến ghép thành công —
            phù hợp với cam kết Net Zero 2050 của Việt Nam.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <Icon className="size-4 text-brand-green" />
      <p className="mt-1.5 text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
