import { motion } from "motion/react";
import { Users, ArrowRight, Clock, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";
import { apiRequest } from "../lib/api";

export function Waitlist() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Owner view — requires a restaurant_id; for MVP we show a placeholder
    setLoading(false);
  }, []);

  const convertToReservation = (id: string) => {
    setWaitlist((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#6366F1] to-[#5558e3] rounded-2xl"><Users className="w-8 h-8 text-white" /></div>
            <div>
              <h1 className="text-5xl font-bold">Waitlist Manager</h1>
              <p className="text-xl text-muted-foreground mt-2">Convert waiting guests to confirmed reservations</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">On Waitlist</p><p className="text-3xl font-bold text-[#6366F1]">{waitlist.length}</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Total Guests</p><p className="text-3xl font-bold">{waitlist.reduce((s, w) => s + (w.guests || 0), 0)}</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Avg Wait Time</p><p className="text-3xl font-bold text-[#F97316]">27 min</p></div>
          <div className="bg-card p-6 rounded-2xl border border-border"><p className="text-sm text-muted-foreground mb-1">Converted Today</p><p className="text-3xl font-bold text-green-600">12</p></div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#F97316]" /></div>
        ) : waitlist.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-card rounded-2xl border border-border">
            <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center"><Users className="w-10 h-10 text-muted-foreground" /></div>
            <h3 className="text-2xl font-semibold mb-2">No one on the waitlist</h3>
            <p className="text-muted-foreground">Great! All guests have been seated. Waitlist entries appear here automatically when tables are full.</p>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            {waitlist.map((item: any, index: number) => (
              <motion.div key={item.id} variants={staggerItem} layoutId={`waitlist-${item.id}`} whileHover={{ scale: 1.01, x: 4 }} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center"><span className="text-xl font-bold text-[#6366F1]">#{index + 1}</span></div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Entry #{item.id}</h3>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{item.guests} guests</span></div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{item.requested_time ? new Date(item.requested_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => convertToReservation(item.id)} className="flex items-center gap-2">
                    <Check className="w-4 h-4" />Convert<ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
