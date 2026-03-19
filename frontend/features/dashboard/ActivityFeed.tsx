"use client";

import { Badge } from "@/components/ui/Badge";

export interface FeedItem {
  id: number;
  icon: string;
  iconBg: string;
  text: string;
  meta: string;
  badge: "ok" | "danger" | "info" | "purple" | "warn";
  badgeText: string;
}

interface Props {
  items: FeedItem[];
}

export function ActivityFeed({ items }: Props) {
  return (
    <div className="flex flex-col gap-[1px]">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-[10px] px-4 py-[10px] hover:bg-[#161422] transition-colors rounded-[8px]">
          <div className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[14px] flex-shrink-0 ${item.iconBg}`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-[#ede9ff] truncate">{item.text}</div>
            <div className="text-[10px] text-[#5a5480] font-mono mt-[1px]">{item.meta}</div>
          </div>
          <Badge variant={item.badge}>{item.badgeText}</Badge>
        </div>
      ))}
    </div>
  );
}
