"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const TAGS = ["Đúng giờ", "Thân thiện", "Lái xe an toàn", "Xe sạch sẽ", "Đúng lộ trình"];

export default function RateTripPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const me = useCurrentUser();
  const match = useAppStore((s) => s.matches[matchId]);
  const users = useAppStore((s) => s.users);
  const submitRating = useAppStore((s) => s.submitRating);
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  if (!match) return null;
  const counterpart = users[me.id === match.driverId ? match.riderId : match.driverId];

  function toggleTag(tag: string) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  function submit() {
    submitRating({ matchId, fromUserId: me.id, toUserId: counterpart.id, stars, tags, comment });
    toast.success("Cảm ơn bạn đã đánh giá chuyến đi!");
    router.replace("/trips");
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Đánh giá chuyến đi" />
      <div className="flex flex-col items-center px-6 py-6">
        <Avatar className="size-16">
          <AvatarImage src={counterpart.avatar} />
          <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
        </Avatar>
        <p className="mt-3 text-base font-semibold">{counterpart.name}</p>
        <p className="text-xs text-muted-foreground">Chuyến đi của bạn thế nào?</p>

        <div className="mt-4 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setStars(s)}>
              <Star className={cn("size-9", s <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
            </button>
          ))}
        </div>

        <div className="mt-6 flex w-full flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                tags.includes(tag) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ thêm về trải nghiệm của bạn (không bắt buộc)"
          className="mt-5 w-full"
          rows={3}
        />

        <Button size="lg" className="mt-6 h-12 w-full rounded-full text-base" onClick={submit}>
          Gửi đánh giá
        </Button>
      </div>
    </div>
  );
}
