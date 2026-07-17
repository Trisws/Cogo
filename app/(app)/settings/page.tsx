"use client";

import { useState } from "react";
import { AlertTriangle, Bell, Lock, ShieldCheck, Users2 } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [samGenderOnly, setSameGenderOnly] = useState(false);
  const [notifTrip, setNotifTrip] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("0987 654 321");

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Cài đặt & An toàn" />

      <div className="space-y-5 px-4 py-4">
        <Section title="Ưu tiên ghép chuyến" icon={Users2}>
          <ToggleRow
            label="Chỉ ghép với người cùng giới tính"
            desc="Ưu tiên hiển thị kết quả cùng giới tính khi tìm chuyến"
            checked={samGenderOnly}
            onCheckedChange={setSameGenderOnly}
          />
        </Section>

        <Section title="Thông báo" icon={Bell}>
          <ToggleRow label="Cập nhật chuyến đi" desc="Ghép chuyến, xác nhận, hành trình" checked={notifTrip} onCheckedChange={setNotifTrip} />
          <ToggleRow label="Ưu đãi & khuyến mãi" desc="Tin tức và ưu đãi từ CoGo" checked={notifPromo} onCheckedChange={setNotifPromo} />
        </Section>

        <Section title="Trung tâm an toàn" icon={ShieldCheck}>
          <div className="space-y-1.5">
            <Label className="text-xs">Liên hệ khẩn cấp</Label>
            <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Số điện thoại này sẽ nhận cảnh báo khi bạn nhấn nút SOS trong lúc di chuyển.
          </p>
          <Button
            variant="outline"
            className="mt-3 h-10 w-full border-destructive/40 text-destructive"
            onClick={() => toast.success("Đã lưu liên hệ khẩn cấp.")}
          >
            <AlertTriangle className="size-4" /> Lưu liên hệ khẩn cấp
          </Button>
        </Section>

        <Section title="Bảo mật & Quyền riêng tư" icon={Lock}>
          <p className="text-xs leading-relaxed text-muted-foreground">
            CoGo mã hoá dữ liệu vị trí và hành trình khi truyền tải, chỉ lưu trữ thông tin cần thiết và không chia sẻ
            dữ liệu định danh với bên thứ ba khi chưa có sự đồng ý của bạn.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="size-3.5" /> {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onCheckedChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
