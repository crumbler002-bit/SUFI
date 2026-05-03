"use client";
import { useState } from "react";
import NoiseCard from "@/components/ui/NoiseCard";
import SufiButton from "@/components/ui/SufiButton";

type Status = "free" | "reserved" | "occupied" | "cleaning";
const cycle: Status[] = ["free", "reserved", "occupied", "cleaning"];

const statusStyle: Record<Status, string> = {
  free:     "border-green-500/40  bg-green-500/8  text-green-400",
  reserved: "border-blue-500/40   bg-blue-500/8   text-blue-400",
  occupied: "border-red-500/40    bg-red-500/8    text-red-400",
  cleaning: "border-yellow-500/40 bg-yellow-500/8 text-yellow-400",
};

const statusDot: Record<Status, string> = {
  free:     "bg-green-400",
  reserved: "bg-blue-400",
  occupied: "bg-red-400",
  cleaning: "bg-yellow-400",
};

const initialTables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: "free" as Status,
  capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
}));

export default function TablesPage() {
  const [tables, setTables] = useState(initialTables);
  const [selected, setSelected] = useState<typeof initialTables[0] | null>(null);

  const toggle = (id: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % cycle.length] } : t
      )
    );
    setSelected((prev) => {
      if (!prev || prev.id !== id) return prev;
      const next = cycle[(cycle.indexOf(prev.status) + 1) % cycle.length];
      return { ...prev, status: next };
    });
  };

  const counts = {
    free:     tables.filter((t) => t.status === "free").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Floor grid */}
      <div className="flex-1 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Tables</h2>
          <div className="flex gap-4 text-xs">
            <span className="text-green-400">{counts.free} free</span>
            <span className="text-blue-400">{counts.reserved} reserved</span>
            <span className="text-red-400">{counts.occupied} occupied</span>
            <span className="text-yellow-400">{counts.cleaning} cleaning</span>
          </div>
        </div>

        <p className="text-xs text-gray-500">Click a table to select · Click again to cycle status</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => { setSelected(table); toggle(table.id); }}
              className={`border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.03] flex flex-col items-center gap-1 ${statusStyle[table.status]} ${selected?.id === table.id ? "ring-2 ring-white/20" : ""}`}
            >
              <span className="text-lg font-semibold">T{table.id}</span>
              <span className="text-xs opacity-70">{table.capacity} seats</span>
              <span className="text-xs capitalize mt-1 opacity-80">{table.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Details panel */}
      <div className="w-64 shrink-0">
        {selected ? (
          <NoiseCard className="p-5 space-y-4" noiseOpacity={0.05}>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${statusDot[selected.status]}`} />
              <h3 className="font-semibold">Table {selected.id}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Capacity</span>
                <span className="text-white">{selected.capacity} seats</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="capitalize text-white">{selected.status}</span>
              </div>
            </div>
            <SufiButton className="w-full" onClick={() => toggle(selected.id)}>
              Cycle Status
            </SufiButton>
          </NoiseCard>
        ) : (
          <NoiseCard className="p-5" noiseOpacity={0.04}>
            <p className="text-sm text-gray-500">Select a table to view details</p>
          </NoiseCard>
        )}
      </div>
    </div>
  );
}
