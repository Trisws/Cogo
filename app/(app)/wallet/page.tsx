"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Lock, Plus, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TOPUP_OPTIONS = [50000, 100000, 200000, 500000];

const TX_STATUS: Record<string, { label: string; tone: string }> = {
  held: { label: "Đang tạm giữ", tone: "bg-amber-500/10 text-amber-600" },
  released: { label: "Đã giải ngân", tone: "bg-brand-green/10 text-brand-green" },
  refunded: { label: "Đã hoàn tiền", tone: "bg-brand-blue/10 text-brand-blue" },
};

export default function WalletPage() {
  const me = useCurrentUser();
  const transactions = useAppStore((s) => s.transactions);
  const users = useAppStore((s) => s.users);
  const matches = useAppStore((s) => s.matches);
  const topUpWallet = useAppStore((s) => s.topUpWallet);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(TOPUP_OPTIONS[1]);

  const myTx = useMemo(
    () =>
      Object.values(transactions)
        .filter((t) => t.payerId === me.id || t.payeeId === me.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [transactions, me.id]
  );

  function confirmTopUp() {
    topUpWallet(amount);
    setOpen(false);
    toast.success(`Đã nạp ${amount.toLocaleString("vi-VN")}đ vào ví CoGo.`);
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Ví CoGo" back={false} />

      <div className="px-4 pt-3">
        <div className="rounded-3xl bg-gradient-to-br from-brand-green to-brand-green-dark p-5 text-primary-foreground shadow-lg">
          <p className="flex items-center gap-1.5 text-xs opacity-90">
            <WalletIcon className="size-3.5" /> Số dư khả dụng
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{me.walletBalance.toLocaleString("vi-VN")}đ</p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-9 flex-1 rounded-xl bg-white/15 text-white hover:bg-white/25"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-3.5" /> Nạp tiền
            </Button>
            <Link
              href="/impact"
              className="flex h-9 flex-1 items-center justify-center rounded-xl bg-white/15 text-sm font-medium text-white hover:bg-white/25"
            >
              Xem tác động →
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border p-3.5 text-center">
            <p className="text-lg font-bold text-brand-green">{me.moneySaved.toLocaleString("vi-VN")}đ</p>
            <p className="text-[11px] text-muted-foreground">Đã tiết kiệm</p>
          </div>
          <div className="rounded-2xl border border-border p-3.5 text-center">
            <p className="text-lg font-bold">{me.tripsCount}</p>
            <p className="text-[11px] text-muted-foreground">Chuyến đã đi</p>
          </div>
        </div>
      </div>

      <div className="mt-5 px-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Lịch sử giao dịch</p>
        <div className="space-y-2">
          {myTx.map((tx) => {
            const isPayer = tx.payerId === me.id;
            const counterpart = users[isPayer ? tx.payeeId : tx.payerId];
            const match = matches[tx.matchId];
            const status = TX_STATUS[tx.status];
            return (
              <div key={tx.id} className="flex items-center gap-3 rounded-2xl border border-border p-3.5">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    isPayer ? "bg-destructive/10 text-destructive" : "bg-brand-green/10 text-brand-green"
                  )}
                >
                  {tx.status === "held" ? (
                    <Lock className="size-4" />
                  ) : isPayer ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownLeft className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    Chuyến với {counterpart?.name ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {match ? format(new Date(match.createdAt), "HH:mm, dd/MM") : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", isPayer ? "text-destructive" : "text-brand-green")}>
                    {isPayer ? "-" : "+"}
                    {(isPayer ? tx.amount : tx.amount - tx.serviceFee).toLocaleString("vi-VN")}đ
                  </p>
                  <Badge className={cn("border-0 font-normal", status.tone)}>{status.label}</Badge>
                </div>
              </div>
            );
          })}

          {myTx.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Chưa có giao dịch nào. Ghép chuyến đầu tiên để bắt đầu!
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nạp tiền vào ví</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-2">
            {TOPUP_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={cn(
                  "rounded-xl border py-3 text-sm font-medium",
                  amount === v ? "border-primary bg-primary/5 text-primary" : "border-border"
                )}
              >
                {v.toLocaleString("vi-VN")}đ
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={confirmTopUp}>
              Xác nhận nạp {amount.toLocaleString("vi-VN")}đ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
