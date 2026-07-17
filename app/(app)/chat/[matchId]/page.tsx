"use client";

import { use, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const AUTO_REPLIES = [
  "Ok bạn nhé, hẹn gặp lúc đó!",
  "Mình sẽ chờ ở điểm đón nha.",
  "Cảm ơn bạn đã xác nhận 🙌",
  "Mình đang di chuyển tới rồi nhé.",
];

export default function ChatThreadPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const me = useCurrentUser();
  const match = useAppStore((s) => s.matches[matchId]);
  const users = useAppStore((s) => s.users);
  const allMessages = useAppStore((s) => s.messages);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const thread = allMessages.filter((m) => m.matchId === matchId);
  const counterpart = match ? users[me.id === match.driverId ? match.riderId : match.driverId] : null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  if (!match || !counterpart) return null;

  function send() {
    if (!text.trim()) return;
    sendMessage(matchId, text.trim());
    setText("");
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    setTimeout(() => {
      sendMessage(matchId, reply, counterpart!.id);
    }, 1400);
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={counterpart.name}
        subtitle={match.status === "ongoing" ? "Đang di chuyển" : "Đối tác chuyến đi"}
        right={
          <Avatar className="size-8">
            <AvatarImage src={counterpart.avatar} />
            <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
          </Avatar>
        }
      />

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.length === 0 && (
          <p className="pt-10 text-center text-xs text-muted-foreground">
            Đây là khởi đầu cuộc trò chuyện với {counterpart.name}.
          </p>
        )}
        {thread.map((m) => {
          const mine = m.senderId === me.id;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                )}
              >
                {m.text}
                <p className={cn("mt-0.5 text-[9px] opacity-70")}>{format(new Date(m.createdAt), "HH:mm")}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Nhắn tin..."
          className="h-10 rounded-full"
        />
        <Button size="icon" className="size-10 shrink-0 rounded-full" onClick={send}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
