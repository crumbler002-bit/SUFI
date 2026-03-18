import { motion } from "motion/react";
import { Calendar, Users, TrendingUp, DollarSign, Clock, Star, BarChart3, Settings } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { AnalyticsCard } from "../components/AnalyticsCard";
import { Button } from "../components/ui/button";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOwnerReservations } from "../services/dashboard";

const revenueData = [
  { day: "Mon", revenue: 4200 }, { day: "Tue", revenue: 3800 }, { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4700 }, { day: "Fri", revenue: 6900 }, { day: "Sat", revenue: 8200 }, { day: "Sun", revenue: 7100 },
];
const reservationData = [
  { hour: "12PM", count: 8 }, { hour: "1PM", count: 12 }, { hour: "2PM", count: 6 },
  { hour: "6PM", count: 15 }, { hour: "7PM", count: 22 }, { hour: "8PM", count: 18 }, { hour: "9PM", count: 10 },
];

export function Dashboard() {
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    getOwnerReservations().then((data: any) => { if (Array.isArray(data)) setReservations(data); }).catch(() => {});
  }, []);

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2">Restaurant Dashboard</h1>
            <p className="text-xl text-muted-foreground">Welcome back! Here's your overview</p>
          </div>
          <Button className="flex items-center gap-2"><Settings className="w-4 h-4" />Settings</Button>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div variants={staggerItem}><AnalyticsCard title="Today's Reservations" value={String(reservations.length || 47)} change={12} icon={<Calendar className="w-6 h-6" />} /></motion.div>
          <motion.div variants={staggerItem}><AnalyticsCard title="Active Diners" value="124" change={8} icon={<Users className="w-6 h-6" />} /></motion.div>
          <motion.div variants={staggerItem}><AnalyticsCard title="Revenue Today" value="$8,240" change={15} icon={<DollarSign className="w-6 h-6" />} /></motion.div>
          <motion.div variants={staggerItem}><AnalyticsCard title="Average Rating" value="4.8" change={5} icon={<Star className="w-6 h-6" />} /></motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[#F97316]" />Weekly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="day" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Clock className="w-6 h-6 text-[#6366F1]" />Peak Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reservationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="hour" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid md:grid-cols-3 gap-6">
          <Link to="/reservations" className="block">
            <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-gradient-to-br from-[#F97316] to-[#ea6a0f] p-8 rounded-2xl text-white cursor-pointer">
              <Calendar className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Manage Reservations</h3>
              <p className="opacity-90">View and manage all bookings</p>
            </motion.div>
          </Link>
          <Link to="/waitlist" className="block">
            <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-gradient-to-br from-[#6366F1] to-[#5558e3] p-8 rounded-2xl text-white cursor-pointer">
              <Users className="w-12 h-12 mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Waitlist Manager</h3>
              <p className="opacity-90">Convert waitlists to reservations</p>
            </motion.div>
          </Link>
          <Link to="/analytics" className="block">
            <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-card border-2 border-[#F97316] p-8 rounded-2xl cursor-pointer">
              <BarChart3 className="w-12 h-12 mb-4 text-[#F97316]" />
              <h3 className="text-2xl font-bold mb-2">Analytics</h3>
              <p className="text-muted-foreground">Detailed insights and reports</p>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
