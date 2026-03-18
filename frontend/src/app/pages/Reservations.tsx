import { motion } from "motion/react";
import { Calendar, Search, User, Clock, Check, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";
import { getOwnerReservations, updateReservationStatus } from "../services/dashboard";

export function Reservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerReservations()
      .then((data: any) => { if (Array.isArray(data)) setReservations(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = reservations.filter((r: any) => {
    const matchesSearch = !searchQuery || JSON.stringify(r).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatus = async (id: number, status: string) => {
    try {
      await updateReservationStatus(id, status);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch {}
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2">Reservations Manager</h1>
            <p className="text-xl text-muted-foreground">Today • {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <Button className="flex items-center gap-2"><Calendar className="w-4 h-4" />Change Date</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Total</p><p className="text-3xl font-bold text-[#F97316]">{reservations.length}</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Confirmed</p><p className="text-3xl font-bold text-green-600">{reservations.filter((r) => r.status === "confirmed").length}</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Pending</p><p className="text-3xl font-bold text-orange-600">{reservations.filter((r) => r.status === "pending").length}</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Total Guests</p><p className="text-3xl font-bold">{reservations.reduce((s, r) => s + (r.guests || 0), 0)}</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search reservations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {["all", "confirmed", "pending", "cancelled"].map((s) => (
              <Button key={s} variant={filterStatus === s ? "default" : "outline"} onClick={() => setFilterStatus(s)} className="capitalize">{s}</Button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#F97316]" /></div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {["Guest / ID", "Time", "Table", "Guests", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-sm font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r: any) => (
                    <motion.tr key={r.id} variants={staggerItem} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F97316]/10 flex items-center justify-center"><User className="w-5 h-5 text-[#F97316]" /></div>
                          <span className="font-medium">#{r.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />{r.reservation_time ? new Date(r.reservation_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</div></td>
                      <td className="px-6 py-4 font-semibold">#{r.table_id || "—"}</td>
                      <td className="px-6 py-4">{r.guests}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : r.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {r.status === "pending" && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleStatus(r.id, "confirmed")} className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200">
                              <Check className="w-4 h-4" />
                            </motion.button>
                          )}
                          {r.status !== "cancelled" && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleStatus(r.id, "cancelled")} className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200">
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No reservations found</div>}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
