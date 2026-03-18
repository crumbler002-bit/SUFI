import { motion } from "motion/react";
import { TrendingUp, Users, DollarSign, Clock, Calendar, Star } from "lucide-react";
import { AnalyticsCard } from "../components/AnalyticsCard";
import { pageTransition, staggerContainer, staggerItem } from "../lib/motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 45000, reservations: 320, customers: 890 },
  { month: "Feb", revenue: 52000, reservations: 380, customers: 1020 },
  { month: "Mar", revenue: 48000, reservations: 350, customers: 950 },
  { month: "Apr", revenue: 61000, reservations: 420, customers: 1150 },
  { month: "May", revenue: 58000, reservations: 400, customers: 1090 },
  { month: "Jun", revenue: 67000, reservations: 480, customers: 1280 },
];

const cuisineData = [
  { name: "Italian", value: 30, color: "#F97316" },
  { name: "Japanese", value: 25, color: "#6366F1" },
  { name: "Mediterranean", value: 20, color: "#10B981" },
  { name: "American", value: 15, color: "#F59E0B" },
  { name: "Other", value: 10, color: "#8B5CF6" },
];

export function Analytics() {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition} className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-xl text-muted-foreground">Comprehensive insights into your restaurant performance</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div variants={staggerItem}><AnalyticsCard title="Monthly Revenue" value="$67,000" change={15.3} icon={<DollarSign className="w-6 h-6" />} /></motion.div>
          <motion.div variants={staggerItem}><AnalyticsCard title="Total Reservations" value="480" change={12.5} icon={<Calendar className="w-6 h-6" />} /></motion.div>
          <motion.div variants={staggerItem}><AnalyticsCard title="Unique Customers" value="1,280" change={8.7} icon={<Users className="w-6 h-6" />} /></motion.div>
          <motion.div variants={staggerItem}><AnalyticsCard title="Avg Rating" value="4.8" change={3.2} icon={<Star className="w-6 h-6" />} /></motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[#F97316]" />Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", r: 6 }} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-[#6366F1]" />Reservations & Customers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="month" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }} />
                <Legend />
                <Bar dataKey="reservations" fill="#6366F1" radius={[8, 8, 0, 0]} name="Reservations" />
                <Bar dataKey="customers" fill="#F97316" radius={[8, 8, 0, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-6">Popular Cuisines</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={cuisineData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                  {cuisineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card p-8 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Clock className="w-6 h-6 text-[#F97316]" />Peak Performance</h3>
            <div className="space-y-4">
              {[{ hour: "7:00 PM", bookings: 45, revenue: "$3,240" }, { hour: "8:00 PM", bookings: 38, revenue: "$2,890" }, { hour: "6:30 PM", bookings: 32, revenue: "$2,450" }, { hour: "9:00 PM", bookings: 28, revenue: "$2,120" }].map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F97316]/10 flex items-center justify-center"><span className="font-bold text-[#F97316]">#{index + 1}</span></div>
                    <div><p className="font-semibold">{item.hour}</p><p className="text-sm text-muted-foreground">{item.bookings} bookings</p></div>
                  </div>
                  <p className="text-lg font-bold text-[#F97316]">{item.revenue}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
