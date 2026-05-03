"use client";
import { useState } from "react";
import SufiCard from "@/components/ui/SufiCard";

type Status = "free" | "reserved" | "occupied";
const cycle: Status[] = ["free", "reserved", "occupied"];

const statusStyle: Record<Status, string> = {
  free: "border-green-500/40 bg-green-500/8 text-green-400",
  reserved: "border-yellow-500/40 bg-yellow-500/8 text-yellow-400",
  occupied: "border-red-500/40 bg-red-500/8 text-red-400",
};

const initialTables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: "free" as Status,
  capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
}));

export default function TablesPage() {
  const [tables, setTables] = useState(initialTables);

  const toggle = (id: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % 3] }
          : t
      )
    );
  };

  const counts = {
    free: tables.filter((t) => t.status === "free").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Tables</h2>
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="text-green-400">{counts.free} free</span>
          <span className="text-yellow-400">{counts.reserved} reserved</span>
          <span className="text-red-400">{counts.occupied} occupied</span>
        </div>
      </div>

      <p className="text-xs text-gray-500">Click a table to cycle its status.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => toggle(table.id)}
            className={`border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.03] flex flex-col items-center gap-1 ${statusStyle[table.status]}`}
          >
            <span className="text-lg font-semibold">T{table.id}</span>
            <span className="text-xs opacity-70">{table.capacity} seats</span>
            <span className="text-xs capitalize mt-1 opacity-80">{table.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
