"use client";

import { Check, Crown, Zap } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Button } from "@/components/ui/button";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const FREE_PERKS = ["Ghép chuyến không giới hạn", "Phí dịch vụ 8%/chuyến", "Đánh giá & xác thực tiêu chuẩn"];
const PRO_PERKS = [
  "Ưu tiên ghép chuyến trong giờ cao điểm",
  "Miễn phí dịch vụ 8% cho 20 chuyến/tháng",
  "Bảo hiểm chuyến đi cao cấp",
  "Lưu tuyến cố định & tự động ghép hàng ngày",
  "Hỗ trợ ưu tiên 24/7",
];

export default function SubscriptionPage() {
  const me = useCurrentUser();
  const subscribeCommuterPass = useAppStore((s) => s.subscribeCommuterPass);
  const isPro = me.subscription === "commuter-pass";

  return (
    <div className="flex flex-col">
      <ScreenHeader title="CoGo Commuter Pass" />
      <div className="space-y-4 px-4 py-4">
        <div className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
          <Crown className="size-7" />
          <p className="mt-2 text-lg font-bold">Commuter Pass</p>
          <p className="text-xs opacity-90">Dành cho người đi làm mỗi ngày (nhóm 996)</p>
          <p className="mt-3 text-2xl font-bold">
            99.000đ<span className="text-sm font-normal opacity-80">/tháng</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <PlanCard title="Miễn phí" active={!isPro} perks={FREE_PERKS} icon={Zap} />
          <PlanCard title="Commuter Pass" active={isPro} perks={PRO_PERKS} icon={Crown} highlight />
        </div>

        <Button
          size="lg"
          className="h-12 w-full rounded-full text-base"
          disabled={isPro}
          onClick={() => {
            subscribeCommuterPass();
            toast.success("Đăng ký CoGo Commuter Pass thành công!");
          }}
        >
          {isPro ? "Bạn đang dùng gói này" : "Đăng ký ngay — 99.000đ/tháng"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">Huỷ bất cứ lúc nào. Thanh toán mô phỏng cho bản demo.</p>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  perks,
  active,
  icon: Icon,
  highlight,
}: {
  title: string;
  perks: string[];
  active: boolean;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        active ? "border-primary ring-1 ring-primary" : "border-border",
        highlight && "bg-amber-500/5"
      )}
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="size-4" /> {title} {active && <span className="text-[10px] font-normal text-brand-green">· Đang dùng</span>}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0 text-brand-green" /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
