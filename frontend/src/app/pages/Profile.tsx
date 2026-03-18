import { motion } from "motion/react";
import { User, Mail, Phone, MapPin, Calendar, Star, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { pageTransition } from "../lib/motion";
import { getMyReservations } from "../services/reservation";

export function Profile() {
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    getMyReservations()
      .then((data: any) => { if (Array.isArray(data)) setReservations(data); })
      .catch(() => {});
  }, []);

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-8 border border-border sticky top-28">
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-[#F97316] to-[#6366F1] rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-1">My Profile</h2>
                <p className="text-muted-foreground">Food Enthusiast</p>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-[#F97316]" /><span>user@example.com</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-[#F97316]" /><span>+1 (555) 123-4567</span></div>
                <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-[#F97316]" /><span>San Francisco, CA</span></div>
              </div>
              <Button className="w-full" variant="outline"><Settings className="w-4 h-4 mr-2" />Edit Profile</Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-2xl border border-border text-center"><Calendar className="w-8 h-8 text-[#F97316] mx-auto mb-2" /><p className="text-3xl font-bold mb-1">{reservations.length || 0}</p><p className="text-sm text-muted-foreground">Total Reservations</p></div>
              <div className="bg-card p-6 rounded-2xl border border-border text-center"><Star className="w-8 h-8 text-[#F97316] mx-auto mb-2" /><p className="text-3xl font-bold mb-1">12</p><p className="text-sm text-muted-foreground">Favorites</p></div>
              <div className="bg-card p-6 rounded-2xl border border-border text-center"><MapPin className="w-8 h-8 text-[#F97316] mx-auto mb-2" /><p className="text-3xl font-bold mb-1">8</p><p className="text-sm text-muted-foreground">Cities Visited</p></div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border">
              <h3 className="text-2xl font-bold mb-6">Your Reservations</h3>
              {reservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reservations yet. <a href="/discover" className="text-[#F97316] hover:underline">Discover restaurants</a> to get started.</p>
              ) : (
                <div className="space-y-4">
                  {reservations.map((r: any, index: number) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ scale: 1.01, x: 4 }} className="p-6 bg-background rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Reservation #{r.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === "confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>{r.status}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{r.reservation_time ? new Date(r.reservation_time).toLocaleDateString() : "—"}</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4" />{r.guests} guests</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
