"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Building2,
  Car,
  ChevronLeft,
  Download,
  Leaf,
  ParkingSquare,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";

export default function EnterprisePage() {
  const enterprise = useAppStore((s) => s.enterprise);
  const users = useAppStore((s) => s.users);
  const companies = Object.values(enterprise);
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const company = enterprise[companyId] ?? companies[0];

  const latest = company.monthlyReports[company.monthlyReports.length - 1];
  const chartData = useMemo(
    () => company.monthlyReports.map((r) => ({ month: r.month.slice(5), co2: r.co2SavedKg })),
    [company]
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar bg-muted/30">
      <div className="bg-gradient-to-br from-brand-blue to-brand-green px-5 pb-6 pt-[calc(env(safe-area-inset-top)+1rem)] text-white">
        <Link href="/home" className="mb-4 flex items-center gap-1 text-xs opacity-90">
          <ChevronLeft className="size-4" /> Quay lại ứng dụng
        </Link>
        <div className="flex items-center gap-2.5">
          <Building2 className="size-7" />
          <div>
            <p className="text-lg font-bold leading-tight">CoGo Enterprise</p>
            <p className="text-xs opacity-85">Dashboard ESG cho doanh nghiệp</p>
          </div>
        </div>

        {companies.length > 1 && (
          <Tabs value={company.id} onValueChange={setCompanyId} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/15">
              {companies.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="text-white data-[state=active]:text-foreground">
                  {c.companyName}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="-mt-3 space-y-4 rounded-t-3xl bg-background px-4 pt-5 pb-8">
        <div>
          <p className="text-sm font-semibold">{company.companyName}</p>
          <p className="text-xs text-muted-foreground">{company.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KpiCard icon={Leaf} label="CO₂ giảm (tháng này)" value={`${latest.co2SavedKg} kg`} tone="text-brand-green" />
          <KpiCard icon={Car} label="Chuyến đi chung" value={`${latest.tripsShared}`} tone="text-brand-blue" />
          <KpiCard icon={Wallet} label="Chi phí tiết kiệm" value={`${(latest.costSavedVnd / 1000000).toFixed(1)}tr`} tone="text-amber-600" />
          <KpiCard icon={ParkingSquare} label="Chỗ đỗ xe giải phóng" value={`${latest.parkingSpotsFreed}`} tone="text-purple-600" />
        </div>

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Lượng CO₂ cắt giảm theo tháng</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(v) => [`${v} kg`, "CO₂"]} />
                <Bar dataKey="co2" radius={[6, 6, 0, 0]} fill="var(--brand-green)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Nhân viên tham gia ({company.employees.length})</p>
          </div>
          <div className="space-y-3">
            {company.employees.map((e) => {
              const u = users[e.userId];
              return (
                <div key={e.userId} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={u?.avatar} />
                    <AvatarFallback>{e.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="text-[11px] text-muted-foreground">{e.department}</p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p className="font-semibold text-foreground">{e.tripsThisMonth} chuyến</p>
                    <p>{e.co2SavedKg}kg CO₂</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-brand-green/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
            <ParkingSquare className="size-3.5" /> Gợi ý tối ưu bãi đỗ xe
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Với {latest.parkingSpotsFreed} chỗ đỗ được giải phóng nhờ đi chung xe, công ty có thể chuyển đổi khu vực
            này thành không gian tiện ích hoặc cho thuê, tiết kiệm ước tính{" "}
            {(latest.parkingSpotsFreed * 1500000).toLocaleString("vi-VN")}đ/tháng chi phí vận hành bãi đỗ.
          </p>
        </div>

        <Button
          className="h-11 w-full rounded-xl"
          onClick={() => toast.success("Đã tạo báo cáo ESG (PDF mô phỏng) cho " + company.companyName)}
        >
          <Download className="size-4" /> Xuất báo cáo ESG tháng này
        </Button>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-3.5">
      <Icon className={`size-4 ${tone}`} />
      <p className="mt-1.5 text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
