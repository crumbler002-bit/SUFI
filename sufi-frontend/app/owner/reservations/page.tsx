"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ownerApi, type OwnerReservation } from "@/lib/api";
import { useAuth } from "@/store/appStore";
import SufiTable from "@/components/ui/SufiTable";

export default function ReservationsPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<number | undefined>();

  const { data: brands } = useQuery({
    queryKey: ["owner-restaurants"],
    queryFn: () => ownerApi.restaurants(),
    enabled: !!user,
  });

  const allLocations = (brands || []).flatMap((b) => b.locations);

  const { data, isLoading } = useQuery({
    queryKey: ["owner-reservations", restaurantId],
    queryFn: () => ownerApi.reservations(restaurantId),
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const reservations: OwnerReservation[] = Array.isArray(data) ? data : [];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      cancelled: "bg-red-500/20 text-red-400",
      completed: "bg-blue-500/20 text-blue-400",
      seated: "bg-purple-500/20 text-purple-400",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${map[status] ?? "bg-gray-500/20 text-gray-400"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Reservations</h2>
        {allLocations.length > 1 && (
          <select
            value={restaurantId ?? ""}
            onChange={(e) => setRestaurantId(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="">All locations</option>
            {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-card border border-white/[0.08] rounded-xl p-5">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : (
          <SufiTable
            data={reservations}
            columns={[
              { key: "customer_name", label: "Guest" },
              {
                key: "time",
                label: "Time",
                render: (v) => v ? new Date(v as string).toLocaleString() : "—",
              },
              { key: "party_size", label: "Guests" },
              { key: "restaurant_name", label: "Location" },
              {
                key: "status",
                label: "Status",
                render: (v) => statusBadge(v as string),
              },
              {
                key: "is_upcoming",
                label: "Type",
                render: (v) => (
                  <span className={`text-xs ${v ? "text-green-400" : "text-gray-500"}`}>
                    {v ? "Upcoming" : "Past"}
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
