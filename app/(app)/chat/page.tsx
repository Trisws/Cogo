"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore, useCurrentUser } from "@/lib/store";

export default function ChatListPage() {
  const me = useCurrentUser();
  const matches = useAppStore((s) => s.matches);
  const users = useAppStore((s) => s.users);
  const messages = useAppStore((s) => s.messages);

  const conversations = useMemo(() => {
    return Object.values(matches)
      .filter((m) => (m.riderId === me.id || m.driverId === me.id) && m.status !== "cancelled")
      .map((m) => {
        const counterpart = users[me.id === m.driverId ? m.riderId : m.driverId];
        const thread = messages.filter((msg) => msg.matchId === m.id);
        const last = thread[thread.length - 1];
        return { match: m, counterpart, last };
      })
      .sort((a, b) => {
        const at = a.last?.createdAt ?? a.match.createdAt;
        const bt = b.last?.createdAt ?? b.match.createdAt;
        return at < bt ? 1 : -1;
      });
  }, [matches, users, messages, me.id]);

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Tin nhắn" back={false} />
      <div className="divide-y divide-border">
        {conversations.map(({ match, counterpart, last }) => (
          <Link key={match.id} href={`/chat/${match.id}`} className="flex items-center gap-3 px-4 py-3.5">
            <Avatar className="size-11">
              <AvatarImage src={counterpart.avatar} />
              <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{counterpart.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {last ? last.text : "Bắt đầu trò chuyện về chuyến đi của bạn"}
              </p>
            </div>
            {last && (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(last.createdAt), { locale: vi, addSuffix: false })}
              </span>
            )}
          </Link>
        ))}

        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <MessageCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Ghép chuyến để bắt đầu trò chuyện với người đi cùng.</p>
          </div>
        )}
      </div>
    </div>
  );
}
