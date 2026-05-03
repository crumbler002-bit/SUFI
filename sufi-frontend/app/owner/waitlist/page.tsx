"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ownerApi } from "@/lib/api";
import { useAuth } from "@/store/appStore";
import SufiCard from "@/components/ui/SufiCard";
import SufiButton from "@/components/ui/SufiButton";

export default function WaitlistPage() {
  const { user } = useAuth();

  const { data: brands } = useQuery({
    queryKey: ["owner-restaurants"],
    queryFn: () => ownerApi.restaurants(),
    enabled: !!user,
  });

  const firstId = (brands || []).flatMap((b) => b.locations)[0]?.id;

  const { data: stats } = useQuery({
    queryKey: ["waitlist-stats", firstId],
    queryFn: () => ownerApi.waitlist(firstId!),
    enabled: !!firstId,
    refetchInterval: 15_000,
  });

  // Mock queue — replace with real waitlist endpoint when available
  const [queue, setQueue] = useState([
    { id: 1, name: "Priya Mehta", guests: 4, waitMin: 25 },
    { id: 2, name: "Rahul Verma", guests: 2, waitMin: 15 },
    { id: 3, name: "Zoe Williams", guests: 6, waitMin: 40 },
  ]);

  const promote = (id: number) => setQueue((q) => q.filter((e) => e.id !== id));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Waitlist</h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <SufiCard>
            <p className="text-xs text-gray-500">Waiting</p>
            <p className="text-2xl font-semibold mt-1">{stats.waiting_count}</p>
          </SufiCard>
          <SufiCard>
            <p className="text-xs text-gray-500">Assigned Today</p>
            <p className="text-2xl font-semibold mt-1">{stats.assigned_today}</p>
          </SufiCard>
          <SufiCard>
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-semibold mt-1">
              {stats.conversion_rate != null ? `${Math.round(stats.conversion_rate * 100)}%` : "—"}
            </p>
          </SufiCard>
        </div>
      )}

      {/* Queue */}
      <div className="flex flex-col gap-3">
        {queue.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">Waitlist is empty.</p>
        ) : (
          queue.map((entry, i) => (
            <SufiCard key={entry.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-600 w-5">#{i + 1}</span>
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {entry.guests} guests · waiting {entry.waitMin} min
                    </p>
                  </div>
                </div>
                <SufiButton onClick={() => promote(entry.id)}>Seat now</SufiButton>
              </div>
            </SufiCard>
          ))
        )}
      </div>
    </div>
  );
}
