"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Car,
  ChevronRight,
  CreditCard,
  IdCard,
  Leaf,
  LogOut,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const me = useCurrentUser();
  const setRoleMode = useAppStore((s) => s.setRoleMode);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const goToStep = useAppStore((s) => s.goToStep);

  const badges = [
    { key: "phone", label: "SĐT", ok: me.verified.phone },
    { key: "email", label: "Email", ok: me.verified.email },
    { key: "cccd", label: "CCCD", ok: me.verified.cccd },
    { key: "license", label: "GPLX", ok: me.verified.license },
  ];

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-b from-brand-green to-brand-green-dark px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-primary-foreground">
        <div className="flex items-center gap-3">
          <Avatar className="size-16 border-2 border-white/40">
            <AvatarImage src={me.avatar} />
            <AvatarFallback>{me.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">{me.name}</p>
            <p className="text-xs opacity-85">{me.phone}</p>
            <div className="mt-1.5 flex items-center gap-3 text-xs opacity-90">
              <span className="flex items-center gap-1">
                <Star className="size-3 fill-amber-300 text-amber-300" /> {me.ratingAvg.toFixed(1)} ({me.ratingCount})
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3" /> Tin cậy {me.trustScore}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <Badge key={b.key} className={`border-0 font-normal ${b.ok ? "bg-white/20" : "bg-white/10 opacity-60"}`}>
              <BadgeCheck className="size-3" /> {b.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="-mt-5 space-y-4 rounded-t-3xl bg-background px-4 pt-5 pb-6">
        <div className="flex items-center justify-between rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2.5">
            <Car className="size-4.5 text-brand-blue" />
            <div>
              <p className="text-sm font-medium">Chế độ tài xế</p>
              <p className="text-[11px] text-muted-foreground">Bật để đăng chuyến cho người khác đi cùng</p>
            </div>
          </div>
          <Switch checked={me.roleMode === "driver"} onCheckedChange={(v) => setRoleMode(v ? "driver" : "rider")} />
        </div>

        {me.vehicle && (
          <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
            <Car className="size-5 text-brand-blue" />
            <div className="text-xs">
              <p className="font-medium">
                {me.vehicle.brand} {me.vehicle.model} · {me.vehicle.color}
              </p>
              <p className="text-muted-foreground">Biển số {me.vehicle.plate} · {me.vehicle.seats} chỗ</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border p-4">
          <p className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
            Điểm tin cậy (Trust Score) <span className="font-semibold text-foreground">{me.trustScore}/100</span>
          </p>
          <Progress value={me.trustScore} className="h-1.5" />
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          <MenuRow icon={Leaf} label="Tác động môi trường của tôi" href="/impact" />
          <MenuRow icon={CreditCard} label="Gói CoGo Commuter Pass" href="/subscription" />
          <MenuRow icon={Bell} label="Thông báo" href="/notifications" />
          <MenuRow icon={Users} label="CoGo Enterprise" href="/enterprise" />
          <MenuRow icon={IdCard} label="Xác thực danh tính" href="/verify" />
          <MenuRow icon={Settings} label="Cài đặt & An toàn" href="/settings" />
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm text-muted-foreground"
          onClick={() => {
            resetDemo();
            toast.success("Đã đặt lại dữ liệu demo.");
          }}
        >
          <RefreshCcw className="size-4" /> Đặt lại dữ liệu demo
        </button>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-medium text-destructive"
          onClick={() => {
            goToStep("phone");
            router.replace("/login");
          }}
        >
          <LogOut className="size-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 bg-card px-4 py-3.5">
      <Icon className="size-4.5 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
